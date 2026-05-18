import { create } from 'zustand'
import axios from 'axios'
import { toast } from 'sonner'

export type Tone = 'NEUTRAL' | 'POLITE' | 'FIRM' | 'URGENT' | 'ESCALATION'

export interface LadderStep {
  id: string
  delayDays: number
  tone: Tone
  escalationEmail?: string
  enabled: boolean
  order: number
}

interface SettingsState {
  ladderSteps: LadderStep[]
  n8nWebhookUrl: string
  followupStartAfterDays: number
  loading: boolean
  hasFetched: boolean
  fetchSettings: () => Promise<void>
  addStep: () => Promise<void>
  updateStep: (id: string, data: Partial<LadderStep>) => Promise<void>
  deleteStep: (id: string) => Promise<void>
  reorderSteps: (activeId: string, overId: string) => Promise<void>
  updateN8nUrl: (url: string) => Promise<void>
  updateFollowupStartAfterDays: (days: number) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ladderSteps: [],
  n8nWebhookUrl: '',
  followupStartAfterDays: 1,
  loading: false,
  hasFetched: false,

  fetchSettings: async () => {
    set({ loading: true })
    try {
      const [ladderRes, configRes] = await Promise.all([
        axios.get('/api/settings/ladder'),
        axios.get('/api/settings/config')
      ])
      set({ 
        ladderSteps: ladderRes.data.sort((a: any, b: any) => a.order - b.order),
        n8nWebhookUrl: configRes.data.N8N_WEBHOOK_URL || '',
        followupStartAfterDays: configRes.data.DEFAULT_FOLLOWUP_START_DAYS ? parseInt(configRes.data.DEFAULT_FOLLOWUP_START_DAYS) : 1
      })
    } catch (error) {
      console.error('Failed to fetch settings', error)
    } finally {
      set({ loading: false, hasFetched: true })
    }
  },


  addStep: async () => {
    const { ladderSteps } = get()
    const lastStep = ladderSteps[ladderSteps.length - 1]
    const newStep = {
      delayDays: (lastStep?.delayDays || 0) + 3,
      tone: 'NEUTRAL' as Tone,
      enabled: true,
      order: ladderSteps.length
    }

    try {
      const res = await axios.post('/api/settings/ladder', newStep)
      set({ ladderSteps: [...ladderSteps, res.data] })
      toast.success('Step added')
    } catch (error) {
      toast.error('Failed to add step')
    }
  },

  updateStep: async (id, data) => {
    try {
      const res = await axios.put(`/api/settings/ladder/${id}`, data)
      set({
        ladderSteps: get().ladderSteps.map(s => s.id === id ? res.data : s)
      })
    } catch (error) {
      toast.error('Failed to update step')
    }
  },

  deleteStep: async (id) => {
    try {
      await axios.delete(`/api/settings/ladder/${id}`)
      set({
        ladderSteps: get().ladderSteps.filter(s => s.id !== id)
      })
      toast.success('Step deleted')
    } catch (error) {
      toast.error('Failed to delete step')
    }
  },

  reorderSteps: async (activeId, overId) => {
    const { ladderSteps } = get()
    const oldIndex = ladderSteps.findIndex(s => s.id === activeId)
    const newIndex = ladderSteps.findIndex(s => s.id === overId)
    
    if (oldIndex === -1 || newIndex === -1) return

    const newSteps = [...ladderSteps]
    const [movedStep] = newSteps.splice(oldIndex, 1)
    newSteps.splice(newIndex, 0, movedStep)

    // Update order values
    const updatedSteps = newSteps.map((step, index) => ({
      ...step,
      order: index
    }))

    set({ ladderSteps: updatedSteps })

    try {
      await axios.put('/api/settings/ladder/reorder', {
        orders: updatedSteps.map(s => ({ id: s.id, order: s.order }))
      })
    } catch (error) {
      toast.error('Failed to save order')
    }
  },

  updateN8nUrl: async (url) => {
    try {
      await axios.post('/api/settings/config', { key: 'N8N_WEBHOOK_URL', value: url })
      set({ n8nWebhookUrl: url })
      toast.success('Webhook URL updated')
    } catch (error) {
      toast.error('Failed to update URL')
    }
  },

  updateFollowupStartAfterDays: async (days) => {
    try {
      await axios.post('/api/settings/config', { key: 'DEFAULT_FOLLOWUP_START_DAYS', value: String(days) })
      set({ followupStartAfterDays: days })
      toast.success('Default follow-up delay updated')
    } catch (error) {
      toast.error('Failed to update default follow-up delay')
    }
  }
}))
