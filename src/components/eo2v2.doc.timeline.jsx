import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
// import { DateFnsAdapter } from '@date-io/date-fns';
import moment from 'moment';
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from '@mui/lab';
import DescriptionIcon from '@mui/icons-material/Description';

export const EO2V2DocTimeline = ({ timeline = [] }) => {
  const uiTimeline = useMemo(() => {
    return timeline.map((it, index) => {
      return {
        ...it,
        key: index,
        // timestamp: DateFnsAdapter.format(it.timestamp, 'fullDateTime12h'),
        timestamp: moment(it.timestamp).format('DD MMM YY hh:mm A'),
      };
    });
  }, [timeline]);
  return (
    <Timeline>
      {uiTimeline.map(it => {
        return (
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <div>
                <div>{it.timestamp}</div>
                <div style={{ display: 'flex' }}>
                  <div style={{ marginTop: '12px', marginRight: '12px' }}>
                    <DescriptionIcon />
                  </div>
                  <div style={{ marginTop: '8px', marginBottom: '18px' }}>
                    <div style={{ marginBottom: '8px' }}>{it.title}</div>
                    <div>{it.description}</div>
                  </div>
                </div>
              </div>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
};

EO2V2DocTimeline.propTypes = {
  timeline: PropTypes.arrayOf({
    timestamp: PropTypes.instanceOf(Date).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
  }),
};
