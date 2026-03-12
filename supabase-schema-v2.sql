-- CHANGA Schema V2 (runnable from scratch)
-- Reminder: enable Realtime in Supabase dashboard for messages + notifications tables.

DROP TRIGGER IF EXISTS on_review_created ON public.reviews;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.update_changarin_rating();
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text NOT NULL,
  phone text,
  avatar_url text,
  role text CHECK (role IN ('cliente', 'changarin')) NOT NULL,
  bio text,
  category text,
  price_from numeric(10,2),
  rating numeric(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  is_available boolean DEFAULT true,
  location text DEFAULT 'Rafaela, Santa Fe',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  changarin_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  description text,
  price_from numeric(10,2),
  price_unit text DEFAULT 'hora',
  is_active boolean DEFAULT true,
  images text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.profiles(id) NOT NULL,
  changarin_id uuid REFERENCES public.profiles(id) NOT NULL,
  service_id uuid REFERENCES public.services(id),
  status text CHECK (status IN ('pending','accepted','in_progress','completed','cancelled')) DEFAULT 'pending',
  scheduled_at timestamptz,
  address text,
  message text,
  total_price numeric(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES public.profiles(id) NOT NULL,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) NOT NULL,
  reviewer_id uuid REFERENCES public.profiles(id) NOT NULL,
  reviewed_id uuid REFERENCES public.profiles(id) NOT NULL,
  rating integer CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(booking_id, reviewer_id)
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  type text CHECK (type IN ('booking_new','booking_accepted','booking_rejected','booking_completed','message_new','review_new')) NOT NULL,
  data jsonb,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_select" ON public.services FOR SELECT USING (true);
CREATE POLICY "services_insert" ON public.services FOR INSERT WITH CHECK (auth.uid() = changarin_id);
CREATE POLICY "services_update" ON public.services FOR UPDATE USING (auth.uid() = changarin_id);
CREATE POLICY "services_delete" ON public.services FOR DELETE USING (auth.uid() = changarin_id);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_select" ON public.bookings FOR SELECT USING (auth.uid() = cliente_id OR auth.uid() = changarin_id);
CREATE POLICY "bookings_insert" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = cliente_id);
CREATE POLICY "bookings_update" ON public.bookings FOR UPDATE USING (auth.uid() = cliente_id OR auth.uid() = changarin_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND (cliente_id = auth.uid() OR changarin_id = auth.uid()))
);
CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND (cliente_id = auth.uid() OR changarin_id = auth.uid()))
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'cliente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_changarin_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET rating = (SELECT AVG(rating) FROM public.reviews WHERE reviewed_id = NEW.reviewed_id),
      review_count = (SELECT COUNT(*) FROM public.reviews WHERE reviewed_id = NEW.reviewed_id)
  WHERE id = NEW.reviewed_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_changarin_rating();
