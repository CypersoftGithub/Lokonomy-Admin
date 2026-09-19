import toast from 'react-hot-toast';

let isRedirecting = false;

export function setupApiInterceptor() {
  if (window._apiInterceptorInstalled) return;
  window._apiInterceptorInstalled = true;

  const originalFetch = window.fetch;

  window.fetch = async function (resource, config = {}) {
    const token = localStorage.getItem('lokonomy_admin_token');
    const urlString = typeof resource === 'string' ? resource : resource?.url || '';

    // Auto-inject Auth headers for internal API calls if token exists
    const isApiCall = urlString.includes('/api/') || urlString.startsWith('/api');

    let updatedConfig = { ...config };
    if (isApiCall && token) {
      const headers = new Headers(updatedConfig.headers || {});
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      if (!headers.has('x-user-type')) {
        headers.set('x-user-type', 'admin');
      }
      updatedConfig.headers = headers;
    }

    try {
      const response = await originalFetch(resource, updatedConfig);

      // Check HTTP 401 Unauthorized status
      if (response.status === 401) {
        handleAuthFailure('Session expired or invalid authentication. Please log in again.');
        return response;
      }

      // Clone response to inspect JSON for backend error payloads
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const clone = response.clone();
        try {
          const resJson = await clone.json();
          if (resJson && resJson.status === false && resJson.error) {
            const errStr = typeof resJson.error === 'string'
              ? resJson.error.toLowerCase()
              : (resJson.error.message || '').toLowerCase();

            if (
              errStr.includes('invalid authentication') ||
              errStr.includes('unauthorized') ||
              errStr.includes('jwt expired') ||
              errStr.includes('token expired')
            ) {
              handleAuthFailure('Invalid authentication found! Redirecting to login...');
            }
          }
        } catch (e) {
          // Response was not JSON, ignore
        }
      }

      return response;
    } catch (err) {
      throw err;
    }
  };
}

function handleAuthFailure(message) {
  if (isRedirecting) return;
  isRedirecting = true;

  // Clear token and user data from local storage
  localStorage.removeItem('lokonomy_admin_token');
  localStorage.removeItem('lokonomy_admin_user');

  // Display toast error
  toast.error(message || 'Invalid authentication found! Please log in again.');

  // Redirect to login page
  setTimeout(() => {
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    } else {
      isRedirecting = false;
    }
  }, 300);
}
