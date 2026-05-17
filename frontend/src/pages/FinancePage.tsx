import { useQuery } from "@tanstack/react-query";
import { getExpenses, getIncome, getCapital } from "@/api/finance";
import type { Expense, Income, Capital } from "@/types";

export default function FinancePage() {
  const {
    data: expenseData,
    isLoading: isExpensesLoading,
    isError: isExpensesError,
  } = useQuery({ queryKey: ["expenses"], queryFn: getExpenses });

  const {
    data: incomeData,
    isLoading: isIncomeLoading,
    isError: isIncomeError,
  } = useQuery({ queryKey: ["income"], queryFn: getIncome });

  const {
    data: capitalData,
    isLoading: isCapitalLoading,
    isError: isCapitalError,
  } = useQuery({ queryKey: ["capital"], queryFn: getCapital });

  const expenses = expenseData?.data.results ?? [];
  const incomes = incomeData?.data.results ?? [];
  const capital = capitalData?.data.results ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Finance</h1>
        <p className="text-sm text-gray-500">Expense, income, and capital records from the backend.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Expenses</h2>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{expenseData?.data.count ?? 0}</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Income</h2>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{incomeData?.data.count ?? 0}</p>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Capital</h2>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{capitalData?.data.count ?? 0}</p>
        </div>
      </div>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
            <p className="text-sm text-gray-500">Latest expense records from the backend.</p>
          </div>
          <div className="text-sm text-gray-600">Total: {expenseData?.data.count ?? 0}</div>
        </div>

        {isExpensesLoading && <p className="text-sm text-gray-500">Loading expenses...</p>}
        {isExpensesError && <p className="text-sm text-red-500">Unable to load expenses.</p>}

        {!isExpensesLoading && !isExpensesError && (
          <div className="overflow-hidden rounded-xl border bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Farm</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Approved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map((expense: Expense) => (
                  <tr key={expense.id}>
                    <td className="px-4 py-4 text-sm text-gray-900">{expense.farm_name}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{expense.category}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">${expense.amount.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{expense.is_approved ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Income</h3>
              <p className="text-sm text-gray-500">Latest income items.</p>
            </div>
            <div className="text-sm text-gray-600">Total: {incomeData?.data.count ?? 0}</div>
          </div>
          {isIncomeLoading && <p className="text-sm text-gray-500">Loading income...</p>}
          {isIncomeError && <p className="text-sm text-red-500">Unable to load income.</p>}
          {!isIncomeLoading && !isIncomeError && (
            <div className="overflow-hidden rounded-xl border bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Farm</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {incomes.map((income: Income) => (
                    <tr key={income.id}>
                      <td className="px-4 py-4 text-sm text-gray-900">{income.farm_name}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{income.source}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">${income.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Capital</h3>
              <p className="text-sm text-gray-500">Most recent capital investments.</p>
            </div>
            <div className="text-sm text-gray-600">Total: {capitalData?.data.count ?? 0}</div>
          </div>
          {isCapitalLoading && <p className="text-sm text-gray-500">Loading capital records...</p>}
          {isCapitalError && <p className="text-sm text-red-500">Unable to load capital.</p>}
          {!isCapitalLoading && !isCapitalError && (
            <div className="overflow-hidden rounded-xl border bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Farm</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {capital.map((item: Capital) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4 text-sm text-gray-900">{item.farm_name}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">${item.amount.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{new Date(item.investment_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
