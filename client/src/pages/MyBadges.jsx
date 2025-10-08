import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMyBadges } from '../features/student/studentSlice';

function MyBadges() {
  const dispatch = useDispatch();
  const { badges, isLoading } = useSelector((state) => state.student);

  useEffect(() => {
    dispatch(getMyBadges());
  }, [dispatch]);

  if (isLoading) {
    return <p>Loading badges...</p>;
  }

  return (
    <div className='container'>
      <section className='heading'>
        <h1>My Achievements</h1>
        <p>Here are the badges you've earned!</p>
      </section>

      <div className='stats-container'>
        {badges.length > 0 ? (
          badges.map((studentBadge) => (
            <div key={studentBadge._id} className='stat-card'>
              <h2 style={{fontSize: '60px'}}>{studentBadge.badge.icon}</h2>
              <h3>{studentBadge.badge.name}</h3>
              <p>{studentBadge.badge.description}</p>
            </div>
          ))
        ) : (
          <p>You haven't earned any badges yet. Complete a quiz to get started!</p>
        )}
      </div>
    </div>
  );
}

export default MyBadges;