// export async function fetchCustomers() {
//     const res = await fetch("http://localhost:5000/api/customers");
//     return res.json();
//   }
  
//   export async function fetchProvinces() {
//     const res = await fetch("http://localhost:5000/api/provinces");
//     return res.json();
//   }
  
//   export async function createCustomer(customerForm) {
//     const res = await fetch("http://localhost:5000/api/customers", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(customerForm)
//     });
//     return res.json();
//   }
  
import API from "../services/api";

// Get all customers
export async function fetchCustomers() {
  const res = await API.get("/customers");
  return res.data;
}

// Get all provinces
export async function fetchProvinces() {
  const res = await API.get("/provinces");
  return res.data;
}

// Create a new customer
export async function createCustomer(customerForm) {
  const res = await API.post("/customers", customerForm);
  return res.data;
}