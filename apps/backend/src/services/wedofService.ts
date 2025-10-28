import axios, { AxiosInstance } from 'axios';

interface WedofConfig {
  apiKey: string;
  baseURL?: string;
}

interface RegistrationFolder {
  id: string;
  reference: string;
  attendee_id: string;
  training_action_id: string;
  state: string;
  created_at: string;
  updated_at: string;
  // Add more fields as needed
}

interface Attendee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  // Add more fields as needed
}

class WedofService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: WedofConfig) {
    this.apiKey = config.apiKey;
    this.client = axios.create({
      baseURL: config.baseURL || 'https://www.wedof.fr/api',
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  // ============================================
  // REGISTRATION FOLDER (Dossier de Formation)
  // ============================================

  /**
   * Get registration folder by reference number (N° dossier)
   */
  async getRegistrationFolderByReference(reference: string): Promise<RegistrationFolder> {
    try {
      const response = await this.client.get(`/registration_folders`, {
        params: { reference },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Wedof API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get registration folder by ID
   */
  async getRegistrationFolder(id: string): Promise<RegistrationFolder> {
    try {
      const response = await this.client.get(`/registration_folders/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Wedof API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * List all registration folders
   */
  async listRegistrationFolders(params?: {
    state?: string;
    limit?: number;
    offset?: number;
  }): Promise<RegistrationFolder[]> {
    try {
      const response = await this.client.get(`/registration_folders`, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(`Wedof API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Create registration folder
   */
  async createRegistrationFolder(data: {
    attendee_id: string;
    training_action_id: string;
    [key: string]: any;
  }): Promise<RegistrationFolder> {
    try {
      const response = await this.client.post(`/registration_folders`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(`Wedof API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Update registration folder
   */
  async updateRegistrationFolder(
    id: string,
    data: Partial<RegistrationFolder>
  ): Promise<RegistrationFolder> {
    try {
      const response = await this.client.patch(`/registration_folders/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(`Wedof API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Declare "Entrée en formation" (Start training)
   */
  async declareEntreeFormation(folderId: string, startDate: string): Promise<any> {
    try {
      const response = await this.client.post(`/registration_folders/${folderId}/in_training`, {
        start_date: startDate,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Wedof API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Declare "Sortie de formation" (End training)
   */
  async declareSortieFormation(folderId: string, endDate: string): Promise<any> {
    try {
      const response = await this.client.post(`/registration_folders/${folderId}/terminate`, {
        end_date: endDate,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Wedof API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Declare "Service fait" (Service done)
   */
  async declareServiceFait(folderId: string): Promise<any> {
    try {
      const response = await this.client.post(`/registration_folders/${folderId}/service_done`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Wedof API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  // ============================================
  // ATTENDEE (Apprenant)
  // ============================================

  /**
   * Get attendee by ID
   */
  async getAttendee(id: string): Promise<Attendee> {
    try {
      const response = await this.client.get(`/attendees/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Wedof API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * List attendees
   */
  async listAttendees(params?: {
    email?: string;
    limit?: number;
    offset?: number;
  }): Promise<Attendee[]> {
    try {
      const response = await this.client.get(`/attendees`, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(`Wedof API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Create attendee
   */
  async createAttendee(data: {
    first_name: string;
    last_name: string;
    email: string;
    [key: string]: any;
  }): Promise<Attendee> {
    try {
      const response = await this.client.post(`/attendees`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(`Wedof API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  // ============================================
  // TRAINING ACTIONS & SESSIONS
  // ============================================

  /**
   * List training actions
   */
  async listTrainingActions(params?: any): Promise<any[]> {
    try {
      const response = await this.client.get(`/training_actions`, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(`Wedof API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * List sessions
   */
  async listSessions(params?: any): Promise<any[]> {
    try {
      const response = await this.client.get(`/sessions`, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(`Wedof API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  // ============================================
  // WEBHOOKS
  // ============================================

  /**
   * Create webhook
   */
  async createWebhook(data: { url: string; events: string[] }): Promise<any> {
    try {
      const response = await this.client.post(`/webhooks`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(`Wedof API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * List webhooks
   */
  async listWebhooks(): Promise<any[]> {
    try {
      const response = await this.client.get(`/webhooks`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Wedof API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(id: string): Promise<void> {
    try {
      await this.client.delete(`/webhooks/${id}`);
    } catch (error: any) {
      throw new Error(`Wedof API Error: ${error.response?.data?.message || error.message}`);
    }
  }
}

// Export singleton instance
const wedofService = new WedofService({
  apiKey: process.env.WEDOF_API_KEY || 'a21c02tr2dea3f077d5f92b1cd8f4c6779b904c2e',
});

export default wedofService;
export { WedofService, type RegistrationFolder, type Attendee };
