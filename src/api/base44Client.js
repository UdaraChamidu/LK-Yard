export const base44 = {
  auth: {
    isAuthenticated: async () => true,
    me: async () => ({
      email: 'demo@lkyard.lk',
      full_name: 'Demo User',
      role: 'admin',
      location: 'Colombo',
      phone: '+94771234567'
    }),
    login: async () => { window.location.href = '/Dashboard' },
    logout: async () => { window.location.href = '/' },
    redirectToLogin: () => { window.location.href = '/Login' },
    updateMe: async (data) => data
  },
  entities: {
    Listing: {
      filter: async () => [],
      list: async () => [],
      create: async (data) => ({ id: Math.random().toString(), ...data }),
      update: async (id, data) => ({ id, ...data }),
      delete: async () => true
    },
    Booking: {
      filter: async () => [],
      create: async (data) => data
    },
    Favorite: {
      filter: async () => [],
      create: async (data) => data,
      delete: async () => true
    },
    LeadRequest: {
      filter: async () => [],
      create: async (data) => data
    },
    Message: {
      filter: async () => [],
      create: async (data) => data
    },
    Profile: {
      filter: async () => [],
      list: async () => [],
      update: async (id, data) => ({ id, ...data })
    },
    Report: {
      create: async (data) => data
    },
    Review: {
      filter: async () => [],
      create: async (data) => data,
      update: async (id, data) => ({ id, ...data }),
      delete: async () => true
    },
    User: {
      list: async () => []
    }
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => ({ file_url: URL.createObjectURL(file) })
    }
  }
};
