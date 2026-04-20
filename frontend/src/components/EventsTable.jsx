import React from 'react';

function EventsTable({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-gray-400 text-center py-8">No events available</div>;
  }

  // Get the most recent 20 events
  const recentEvents = data.slice(0, 20);

  const formatEventTime = (event) => {
    const timeField = event.timeTag || event.startTime || event.observedTime || event.startTime;
    if (!timeField) return 'N/A';
    try {
      return new Date(timeField).toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  const getEventMagnitude = (event) => {
    if (event.eventType === 'CME') {
      return event.speed ? `${event.speed} km/s` : 'N/A';
    } else if (event.eventType === 'FLR') {
      return event.classType || 'N/A';
    } else if (event.eventType === 'GST') {
      return event.kpIndex ? `Kp ${event.kpIndex}` : 'N/A';
    }
    return 'N/A';
  };

  const getRiskContribution = (event) => {
    // Simplified risk contribution based on event type and magnitude
    if (event.eventType === 'CME') {
      const speed = event.speed || 0;
      if (speed >= 3000) return 'High (6.0)';
      if (speed >= 2000) return 'Medium-High (4.5)';
      if (speed >= 1500) return 'Medium (3.0)';
      return 'Low (1.0-2.0)';
    } else if (event.eventType === 'FLR') {
      const classType = event.classType || '';
      if (classType.startsWith('X')) return 'High (5.0)';
      if (classType.startsWith('M')) return 'Medium (3.0-4.0)';
      if (classType.startsWith('C')) return 'Low-Medium (2.0)';
      return 'Low (1.0)';
    } else if (event.eventType === 'GST') {
      const kp = event.kpIndex || 0;
      if (kp >= 7) return 'High (6.5-8.0)';
      if (kp >= 5) return 'Medium (5.0)';
      return 'Low (3.0)';
    }
    return 'Low (1.0)';
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'CME':
        return 'bg-purple-600';
      case 'FLR':
        return 'bg-orange-600';
      case 'GST':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getEventTypeLabel = (type) => {
    switch (type) {
      case 'CME':
        return 'Coronal Mass Ejection';
      case 'FLR':
        return 'Solar Flare';
      case 'GST':
        return 'Geomagnetic Storm';
      default:
        return type;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-space-600">
            <th className="text-left py-3 px-4 text-gray-400 font-semibold">Event Type</th>
            <th className="text-left py-3 px-4 text-gray-400 font-semibold">Time</th>
            <th className="text-left py-3 px-4 text-gray-400 font-semibold">Magnitude</th>
            <th className="text-left py-3 px-4 text-gray-400 font-semibold">Risk Contribution</th>
          </tr>
        </thead>
        <tbody>
          {recentEvents.map((event, index) => (
            <tr key={index} className="border-b border-space-600 hover:bg-space-700/50">
              <td className="py-3 px-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${getEventTypeColor(event.eventType)}`}>
                  {getEventTypeLabel(event.eventType)}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-300">{formatEventTime(event)}</td>
              <td className="py-3 px-4 text-gray-300">{getEventMagnitude(event)}</td>
              <td className="py-3 px-4 text-gray-300">{getRiskContribution(event)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EventsTable;
