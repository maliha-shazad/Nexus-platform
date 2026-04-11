import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { X, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

interface AvailabilitySlot {
  id: string;
  start: string;
  end: string;
  title: string;
}

interface Meeting {
  id: string;
  start: string;
  end: string;
  title: string;
  attendeeName: string;
  attendeeEmail: string;
  status: 'pending' | 'accepted' | 'declined';
}

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeeName, setAttendeeName] = useState('');

  if (!user) return null;

  // Load data from localStorage
  useEffect(() => {
    const savedAvailability = localStorage.getItem(`availability_${user.id}`);
    const savedMeetings = localStorage.getItem(`meetings_${user.id}`);
    
    if (savedAvailability) setAvailability(JSON.parse(savedAvailability));
    if (savedMeetings) setMeetings(JSON.parse(savedMeetings));
  }, [user.id]);

  // Save meetings whenever they change
  useEffect(() => {
    localStorage.setItem(`meetings_${user.id}`, JSON.stringify(meetings));
  }, [meetings, user.id]);

  const handleDateSelect = (selectInfo: any) => {
    setSelectedSlot(selectInfo);
    setShowModal(true);
  };

  const addAvailabilitySlot = () => {
    if (selectedSlot) {
      const newSlot: AvailabilitySlot = {
        id: Date.now().toString(),
        start: selectedSlot.startStr,
        end: selectedSlot.endStr,
        title: 'Available'
      };
      const updated = [...availability, newSlot];
      setAvailability(updated);
      localStorage.setItem(`availability_${user.id}`, JSON.stringify(updated));
      setShowModal(false);
      setMeetingTitle('');
    }
  };

  const sendMeetingRequest = () => {
    if (selectedSlot && meetingTitle) {
      const newMeeting: Meeting = {
        id: Date.now().toString(),
        start: selectedSlot.startStr,
        end: selectedSlot.endStr,
        title: meetingTitle,
        attendeeName: attendeeName || 'Unknown',
        attendeeEmail: attendeeEmail || 'unknown@email.com',
        status: 'pending'
      };
      const updated = [...meetings, newMeeting];
      setMeetings(updated);
      setShowModal(false);
      setMeetingTitle('');
      setAttendeeEmail('');
      setAttendeeName('');
    }
  };

  const updateMeetingStatus = (meetingId: string, status: 'accepted' | 'declined') => {
    const updated = meetings.map(m => 
      m.id === meetingId ? { ...m, status } : m
    );
    setMeetings(updated);
  };

  // Format events for FullCalendar
  const calendarEvents = [
    ...availability.map(slot => ({
      id: slot.id,
      title: '📅 Available',
      start: slot.start,
      end: slot.end,
      backgroundColor: '#10b981',
      borderColor: '#10b981',
    })),
    ...meetings.map(meeting => ({
      id: meeting.id,
      title: `${meeting.title} (${meeting.status})`,
      start: meeting.start,
      end: meeting.end,
      backgroundColor: meeting.status === 'pending' ? '#f59e0b' : 
                       meeting.status === 'accepted' ? '#10b981' : '#ef4444',
      borderColor: meeting.status === 'pending' ? '#f59e0b' : 
                   meeting.status === 'accepted' ? '#10b981' : '#ef4444',
    }))
  ];

  const pendingMeetings = meetings.filter(m => m.status === 'pending');
  const acceptedMeetings = meetings.filter(m => m.status === 'accepted');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meeting Schedule</h1>
          <p className="text-gray-600">Manage your availability and schedule meetings</p>
        </div>
        <Link to={`/dashboard/${user?.role}`}>
          <Button variant="outline" leftIcon={<ArrowLeft size={18} />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar - takes 2/3 of space */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Calendar</h2>
            </CardHeader>
            <CardBody>
              <div className="mb-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-sm">Pending Meeting</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-sm">Accepted Meeting</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-sm">Declined Meeting</span>
                </div>
              </div>
              
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                initialView="timeGridWeek"
                selectable={true}
                select={handleDateSelect}
                events={calendarEvents}
                height="auto"
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                allDaySlot={false}
              />
            </CardBody>
          </Card>
        </div>

        {/* Meetings Lists - takes 1/3 of space */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-md font-medium text-gray-900">Pending Requests ({pendingMeetings.length})</h3>
            </CardHeader>
            <CardBody>
              {pendingMeetings.length === 0 ? (
                <p className="text-gray-500 text-sm">No pending meeting requests</p>
              ) : (
                <div className="space-y-3">
                  {pendingMeetings.map(meeting => (
                    <div key={meeting.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{meeting.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(meeting.start).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">From: {meeting.attendeeName}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateMeetingStatus(meeting.id, 'accepted')}
                          className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => updateMeetingStatus(meeting.id, 'declined')}
                          className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-md font-medium text-gray-900">Confirmed Meetings ({acceptedMeetings.length})</h3>
            </CardHeader>
            <CardBody>
              {acceptedMeetings.length === 0 ? (
                <p className="text-gray-500 text-sm">No confirmed meetings</p>
              ) : (
                <div className="space-y-3">
                  {acceptedMeetings.map(meeting => (
                    <div key={meeting.id} className="p-3 bg-green-50 rounded-lg">
                      <p className="font-medium text-sm">{meeting.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(meeting.start).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">With: {meeting.attendeeName}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Modal for adding availability/meeting */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Schedule</h3>
            <p className="text-sm text-gray-600 mb-4">
              Time: {selectedSlot?.startStr} - {selectedSlot?.endStr}
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">What would you like to do?</label>
              <div className="flex gap-3">
                <button
                  onClick={addAvailabilitySlot}
                  className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
                >
                  Mark as Available
                </button>
                <button
                  onClick={() => document.getElementById('meetingForm')?.classList.toggle('hidden')}
                  className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  Schedule Meeting
                </button>
              </div>
            </div>

            <div id="meetingForm" className="hidden space-y-3 mt-4 pt-4 border-t">
              <input
                type="text"
                placeholder="Meeting Title"
                className="w-full p-2 border rounded"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Attendee Name"
                className="w-full p-2 border rounded"
                value={attendeeName}
                onChange={(e) => setAttendeeName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Attendee Email"
                className="w-full p-2 border rounded"
                value={attendeeEmail}
                onChange={(e) => setAttendeeEmail(e.target.value)}
              />
              <button
                onClick={sendMeetingRequest}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Send Meeting Request
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full text-gray-500 py-2 rounded border hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};