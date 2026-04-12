import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { X, Check, ArrowLeft, Calendar, Clock, Users } from 'lucide-react';
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
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [currentView, setCurrentView] = useState<'calendar' | 'requests'>('calendar');

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
    setShowMeetingForm(false);
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
      setShowMeetingForm(false);
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
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 animate-fade-in max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Meeting Schedule</h1>
            <p className="text-sm md:text-base text-gray-600">Manage your availability and schedule meetings</p>
          </div>
          <Link to={`/dashboard/${user?.role}`}>
            <Button variant="outline" leftIcon={<ArrowLeft size={18} />} className="w-full sm:w-auto">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Mobile View Toggle */}
        <div className="lg:hidden">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setCurrentView('calendar')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                currentView === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar size={16} className="inline mr-2" />
              Calendar
            </button>
            <button
              onClick={() => setCurrentView('requests')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                currentView === 'requests'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users size={16} className="inline mr-2" />
              Requests ({pendingMeetings.length})
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Calendar Section */}
          <div className={`${currentView === 'calendar' ? 'block' : 'hidden lg:block'} lg:col-span-2`}>
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Calendar</h2>
              </CardHeader>
              <CardBody>
                {/* Legend - Responsive Grid */}
                <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded flex-shrink-0"></div>
                    <span className="text-xs md:text-sm">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded flex-shrink-0"></div>
                    <span className="text-xs md:text-sm">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded flex-shrink-0"></div>
                    <span className="text-xs md:text-sm">Accepted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded flex-shrink-0"></div>
                    <span className="text-xs md:text-sm">Declined</span>
                  </div>
                </div>
                
                {/* Calendar Container - Mobile Responsive */}
                <div className="calendar-container">
                  <style>{`
                    .calendar-container .fc {
                      font-size: 12px;
                    }
                    .calendar-container .fc .fc-toolbar {
                      flex-direction: column;
                      gap: 10px;
                    }
                    .calendar-container .fc .fc-toolbar-title {
                      font-size: 1.2em;
                    }
                    .calendar-container .fc .fc-button {
                      padding: 0.4em 0.6em;
                      font-size: 0.9em;
                    }
                    .calendar-container .fc .fc-view-harness {
                      min-height: 400px;
                    }
                    @media (min-width: 768px) {
                      .calendar-container .fc {
                        font-size: 14px;
                      }
                      .calendar-container .fc .fc-toolbar {
                        flex-direction: row;
                      }
                    }
                    @media (max-width: 640px) {
                      .calendar-container .fc .fc-toolbar {
                        flex-wrap: wrap;
                      }
                      .calendar-container .fc .fc-toolbar > div {
                        width: 100%;
                        justify-content: center;
                      }
                      .calendar-container .fc .fc-button-group {
                        width: 100%;
                        justify-content: center;
                      }
                    }
                  `}</style>
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    initialView={window.innerWidth < 768 ? "timeGridDay" : "timeGridWeek"}
                    selectable={true}
                    select={handleDateSelect}
                    events={calendarEvents}
                    height="auto"
                    slotMinTime="08:00:00"
                    slotMaxTime="20:00:00"
                    allDaySlot={false}
                    nowIndicator={true}
                    weekends={true}
                    businessHours={{
                      daysOfWeek: [1, 2, 3, 4, 5],
                      startTime: '09:00',
                      endTime: '18:00',
                    }}
                  />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Meetings Lists Section */}
          <div className={`${currentView === 'requests' ? 'block' : 'hidden lg:block'} space-y-4 md:space-y-6`}>
            {/* Pending Requests Card */}
            <Card>
              <CardHeader>
                <h3 className="text-md font-medium text-gray-900 flex items-center justify-between">
                  <span>Pending Requests</span>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {pendingMeetings.length}
                  </span>
                </h3>
              </CardHeader>
              <CardBody>
                {pendingMeetings.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">No pending meeting requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingMeetings.map(meeting => (
                      <div key={meeting.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{meeting.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock size={12} className="text-gray-400 flex-shrink-0" />
                            <p className="text-xs text-gray-500 truncate">
                              {new Date(meeting.start).toLocaleString([], { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 truncate">From: {meeting.attendeeName}</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => updateMeetingStatus(meeting.id, 'accepted')}
                            className="flex-1 sm:flex-none p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => updateMeetingStatus(meeting.id, 'declined')}
                            className="flex-1 sm:flex-none p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
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

            {/* Confirmed Meetings Card */}
            <Card>
              <CardHeader>
                <h3 className="text-md font-medium text-gray-900 flex items-center justify-between">
                  <span>Confirmed Meetings</span>
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {acceptedMeetings.length}
                  </span>
                </h3>
              </CardHeader>
              <CardBody>
                {acceptedMeetings.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">No confirmed meetings</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {acceptedMeetings.map(meeting => (
                      <div key={meeting.id} className="p-3 bg-green-50 rounded-lg">
                        <p className="font-medium text-sm">{meeting.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock size={12} className="text-gray-400" />
                          <p className="text-xs text-gray-500">
                            {new Date(meeting.start).toLocaleString([], { 
                              month: 'short', 
                              day: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">With: {meeting.attendeeName}</p>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-5 md:p-6 max-w-md w-full mx-auto">
              <h3 className="text-lg md:text-xl font-bold mb-4">Schedule</h3>
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                <Clock size={14} className="inline mr-1 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {selectedSlot?.startStr ? new Date(selectedSlot.startStr).toLocaleString([], { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) : ''} - {selectedSlot?.endStr ? new Date(selectedSlot.endStr).toLocaleString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) : ''}
                </span>
              </div>
              
              {!showMeetingForm ? (
                <>
                  <div className="space-y-3">
                    <button
                      onClick={addAvailabilitySlot}
                      className="w-full bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                      Mark as Available
                    </button>
                    <button
                      onClick={() => setShowMeetingForm(true)}
                      className="w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      Schedule Meeting
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Meeting Title *"
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Attendee Name *"
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                  />
                  <input
                    type="email"
                    placeholder="Attendee Email *"
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                  />
                  <button
                    onClick={sendMeetingRequest}
                    className="w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Send Meeting Request
                  </button>
                  <button
                    onClick={() => setShowMeetingForm(false)}
                    className="w-full text-gray-600 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setShowModal(false);
                  setShowMeetingForm(false);
                }}
                className="mt-3 w-full text-gray-500 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};