import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from "@/api/employees";
import { getFarms } from "@/api/farms";
import type { Employee, Farm, PaginatedResponse } from "@/types";

type EmployeePayload = {
  full_name: string;
  role: string;
  salary: number;
  farm: string;
  status?: string;
  hire_date: string;
};

const roles = ["farmer", "worker", "manager"];
const statuses = ["active", "inactive"];

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formState, setFormState] = useState({
    full_name: "",
    role: "farmer",
    salary: "0",
    farm: "",
    status: "active",
    hire_date: new Date().toISOString().slice(0, 10),
  });
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [mutationSuccess, setMutationSuccess] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<PaginatedResponse<Employee>, Error>({
    queryKey: ["employees"],
    queryFn: () => getEmployees(),
  });
  const employees = data?.data.results ?? [];

  const { data: farmsData } = useQuery<PaginatedResponse<Farm>, Error>({
    queryKey: ["farms"],
    queryFn: () => getFarms({ page_size: "100" }),
  });
  const farms = farmsData?.data.results ?? [];

  const createMutation = useMutation<any, Error, EmployeePayload>({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsFormOpen(false);
      setSelectedEmployee(null);
    },
  });

  const updateMutation = useMutation<any, Error, { id: string; payload: EmployeePayload }>({
    mutationFn: ({ id, payload }) => updateEmployee(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsFormOpen(false);
      setSelectedEmployee(null);
    },
  });

  const deleteMutation = useMutation<any, Error, string>({
    mutationFn: deleteEmployee,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }),
  });

  const isMutating = Boolean((createMutation as any)?.isLoading || (updateMutation as any)?.isLoading || (deleteMutation as any)?.isLoading);

  const openNewEmployeeForm = () => {
    setSelectedEmployee(null);
    setFormState({
      full_name: "",
      role: "farmer",
      salary: "0",
      farm: farms[0]?.id ?? "",
      status: "active",
      hire_date: new Date().toISOString().slice(0, 10),
    });
    setIsFormOpen(true);
  };

  const openEditEmployeeForm = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormState({
      full_name: employee.full_name,
      role: employee.role,
      salary: employee.salary?.toString() ?? "0",
      farm: employee.farm,
      status: employee.status,
      hire_date: employee.hire_date.slice(0, 10),
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMutationError(null);
    setMutationSuccess(null);

    const payload: EmployeePayload = {
      full_name: formState.full_name,
      role: formState.role,
      salary: Number(formState.salary),
      farm: formState.farm,
      hire_date: formState.hire_date,
      status: formState.status,
    };

    try {
      if (selectedEmployee) {
        await updateMutation.mutateAsync({ id: selectedEmployee.id, payload });
        setMutationSuccess("Employee updated.");
      } else {
        await createMutation.mutateAsync(payload);
        setMutationSuccess("Employee created.");
      }
    } catch (err: any) {
      console.error("Employee mutation failed", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to save employee.";
      setMutationError(msg);
    }
  };

  const handleDelete = async (employeeId: string) => {
    if (!window.confirm("Delete this employee?")) return;
    await deleteMutation.mutateAsync(employeeId);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500">Create, update, and delete employee records for your farms.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">Total: {data?.data.count ?? 0}</div>
          <button
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            onClick={openNewEmployeeForm}
          >
            Add Employee
          </button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading employees...</p>}
      {isError && <p className="text-sm text-red-500">Unable to load employees.</p>}

      {isFormOpen && (
        <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedEmployee ? "Edit Employee" : "Add Employee"}
            </h2>
            <button
              className="text-sm text-gray-500 hover:text-gray-700"
              onClick={() => {
                setIsFormOpen(false);
                setSelectedEmployee(null);
              }}
            >
              Cancel
            </button>
          </div>
              {mutationError && <p className="text-sm text-red-500">{mutationError}</p>}
              {mutationSuccess && <p className="text-sm text-green-600">{mutationSuccess}</p>}
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Full name</span>
              <input
                value={formState.full_name}
                onChange={(e) => setFormState((prev) => ({ ...prev, full_name: e.target.value }))}
                required
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Role</span>
              <select
                value={formState.role}
                onChange={(e) => setFormState((prev) => ({ ...prev, role: e.target.value }))}
                className="mt-1 w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Salary</span>
              <input
                type="number"
                min="0"
                value={formState.salary}
                onChange={(e) => setFormState((prev) => ({ ...prev, salary: e.target.value }))}
                required
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <select
                value={formState.status}
                onChange={(e) => setFormState((prev) => ({ ...prev, status: e.target.value }))}
                className="mt-1 w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-gray-700">Farm</span>
              <select
                value={formState.farm}
                onChange={(e) => setFormState((prev) => ({ ...prev, farm: e.target.value }))}
                required
                className="mt-1 w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select a farm</option>
                {farms.map((farm: Farm) => (
                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Hire date</span>
              <input
                type="date"
                value={formState.hire_date}
                onChange={(e) => setFormState((prev) => ({ ...prev, hire_date: e.target.value }))}
                required
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </label>
            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
              <button
                type="button"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setIsFormOpen(false);
                  setSelectedEmployee(null);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                disabled={isMutating}
              >
                {selectedEmployee ? "Save Changes" : "Create Employee"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Farm</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Salary</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((employee: Employee) => (
                <tr key={employee.id}>
                  <td className="px-4 py-4 text-sm text-gray-900">{employee.full_name}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{employee.role}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{employee.status}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{employee.farm_name}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">${employee.salary?.toLocaleString() ?? "-"}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="flex gap-2">
                      <button
                        className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                        onClick={() => openEditEmployeeForm(employee)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                        onClick={() => handleDelete(employee.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
