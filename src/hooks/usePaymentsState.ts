/**
 * WHY: Keep payment methods and transaction state in a dedicated hook instead of the app-state composition layer.
 * CHANGED: YYYY-MM-DD
 */
import { useCallback, useState } from "react";
import { getPaymentMethods, getTransactions } from "../services/payments.service";
import { successResult } from "../services/service.utils";
import { PaymentMethod, Transaction } from "../types/domain";

interface UsePaymentsStateOptions {
  userId: string | null;
  pushError: (message?: string) => void;
}

export function usePaymentsState({ userId, pushError }: UsePaymentsStateOptions) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const loadPaymentsData = useCallback(async () => {
    if (!userId) {
      setPaymentMethods([]);
      setTransactions([]);
      return {
        methodsResult: successResult<PaymentMethod[]>([], "fallback"),
        transactionsResult: successResult<Transaction[]>([], "fallback"),
      };
    }

    const [methodsResult, transactionsResult] = await Promise.all([
      getPaymentMethods(userId),
      getTransactions(userId),
    ]);

    setPaymentMethods(methodsResult.data);
    setTransactions(transactionsResult.data);
    pushError(methodsResult.error ?? transactionsResult.error);

    return { methodsResult, transactionsResult };
  }, [pushError, userId]);

  const resetPaymentsState = useCallback(() => {
    setPaymentMethods([]);
    setTransactions([]);
  }, []);

  return {
    paymentMethods,
    transactions,
    loadPaymentsData,
    resetPaymentsState,
  };
}
