import axios from 'axios';

export interface WorkflowDetail {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  graph_data: {
    nodes: any[];
    edges: any[];
  };
  created_at: string;
  updated_at: string;
}

export interface WorkflowSavePayload {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  graph_data: {
    nodes: any[];
    edges: any[];
  };
}

const apiClient = axios.create({
  baseURL: '/api/workflow',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const workflowApi = {
  async save(payload: WorkflowSavePayload): Promise<WorkflowDetail> {
    const res = await apiClient.post<WorkflowDetail>('/save', payload);
    return res.data;
  },

  async getMyWorkflows(userId: string): Promise<WorkflowDetail[]> {
    const res = await apiClient.get<WorkflowDetail[]>('/my', {
      params: { user_id: userId },
    });
    return res.data;
  },

  async delete(workflowId: string, userId: string): Promise<void> {
    await apiClient.delete(`/${workflowId}`, {
      params: { user_id: userId },
    });
  },
};
