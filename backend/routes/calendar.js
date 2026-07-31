import express from 'express'
import fetch from 'node-fetch'
import ical from 'ical'

const router = express.Router()

// POST /api/calendar/sync - Fetch and sync Google Calendar
router.post('/sync', async (req, res) => {
  try {
    const calendarUrl = process.env.GOOGLE_CALENDAR_URL

    if (!calendarUrl) {
      return res.status(400).json({ error: 'Google Calendar URL not configured' })
    }

    // Fetch iCalendar data
    const response = await fetch(calendarUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch calendar: ${response.statusText}`)
    }

    const icalData = await response.text()
    
    // Parse events from iCalendar data
    let eventCount = 0
    const now = new Date()
    
    // Simple regex to extract VEVENT blocks
    const eventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g
    const eventMatches = icalData.matchAll(eventRegex)
    
    for (const match of eventMatches) {
      const eventData = match[1]
      
      // Extract fields
      const summaryMatch = eventData.match(/SUMMARY:(.+)/)?.[1]?.trim()
      const uidMatch = eventData.match(/UID:(.+)/)?.[1]?.trim()
      const dtStartMatch = eventData.match(/DTSTART(?:;[^:]*)?:(.+)/)?.[1]?.trim()
      
      if (!summaryMatch || !uidMatch || !dtStartMatch) continue
      
      try {
        // Parse date - handle both formats (basic: 20260731T180000Z and full: 20260731T180000)
        let eventDate = new Date(dtStartMatch.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?/, '$1-$2-$3T$4:$5:$6Z'))
        
        // ONLY add future events (skip past events)
        if (eventDate < now) {
          continue
        }
        
        // Check if event already exists
        const { data: existing } = await req.supabase
          .from('calendar_events')
          .select('id')
          .eq('google_event_id', uidMatch)
          .single()

        if (!existing) {
          const { error } = await req.supabase
            .from('calendar_events')
            .insert([{
              google_event_id: uidMatch,
              title: summaryMatch,
              event_date: eventDate.toISOString(),
              is_match: true  // Default to TRUE - admin can unmark if needed
            }])

          if (!error) {
            eventCount++
          }
        }
      } catch (e) {
        console.error('Error parsing event:', e)
      }
    }
    
    res.json({ 
      message: 'Calendar synced - only future events', 
      eventsCount: eventCount,
      note: 'Bestaande events blijven behouden. Alleen nieuwe toekomstige events worden toegevoegd.'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/calendar/events - Get all calendar events
router.get('/events', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('calendar_events')
      .select('*')
      .order('event_date', { ascending: false })

    if (error) throw error

    res.json(data || [])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/calendar/:eventId/mark-as-match - Toggle event as match
router.put('/:eventId/mark-as-match', async (req, res) => {
  try {
    const { eventId } = req.params
    const { is_match } = req.body

    const { data, error } = await req.supabase
      .from('calendar_events')
      .update({ is_match })
      .eq('id', eventId)
      .select()

    if (error) throw error

    res.json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
