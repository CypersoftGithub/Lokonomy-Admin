import { API_BASE_URL } from '../config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('lokonomy_admin_token');
  const headers = {
    'Content-Type': 'application/json',
    'accept': '*/*',
    'x-user-type': 'admin',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Fetch business list for cash collection
 */
export const GetBusinessData = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/business/get`, {
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (result.status) {
      return result.data || [];
    }
    console.error('Error in GetBusinessData:', result.message || 'Unknown status');
    return [];
  } catch (error) {
    console.error('Error fetching business data:', error);
    return [];
  }
};

/**
 * Fetch global subscription plans
 */
export const GetPlans = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/global/plans`, {
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (result.status) {
      return result.data || [];
    }
    console.error('Error in GetPlans:', result.message || 'Unknown status');
    return [];
  } catch (error) {
    console.error('Error fetching plans data:', error);
    return [];
  }
};

/**
 * Update business status flag
 */
export const UpdateBusinessStatus = async (business_id) => {
  const res = await fetch(`${API_BASE_URL}/api/business/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ business_id, flag_deleted: false }),
  });
  const data = await res.json();
  if (!res.ok || (data.status !== undefined && !data.status)) {
    throw new Error(data.message || 'Failed to update business status');
  }
  return data;
};

/**
 * Save cash payment record
 */
export const SavePaymentData = async (user_id, payment_amount, validity, is_plan_upgrade) => {
  const res = await fetch(`${API_BASE_URL}/api/global/save-payment`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      user_id,
      payment_amount,
      validity,
      order_status: 'Success',
      is_plan_upgrade,
    }),
  });
  const data = await res.json();
  if (!res.ok || (data.status !== undefined && !data.status)) {
    throw new Error(data.message || 'Failed to save payment data');
  }
  return data;
};
