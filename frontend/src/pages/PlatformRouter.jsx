import React from 'react';
import ZomatoDashboard  from './ZomatoDashboard';
import SwiggyDashboard  from './SwiggyDashboard';
import AmazonDashboard  from './AmazonDashboard';

/**
 * PlatformRouter
 * Reads user.platform and renders the correct branded dashboard.
 * Falls back to a generic neutral version for unknown platforms.
 */
const PlatformRouter = ({ user, policies, myClaims, loading, onActivate, activating, onToggleReminder }) => {
  const platform = (user?.platform || '').toLowerCase().trim();

  const sharedProps = { user, policies, myClaims, loading, onActivate, activating, onToggleReminder };

  if (platform === 'zomato')       return <ZomatoDashboard  {...sharedProps} />;
  if (platform === 'swiggy')       return <SwiggyDashboard  {...sharedProps} />;
  if (platform === 'amazon')       return <AmazonDashboard  {...sharedProps} />;

  // Fallback – Zomato as default styled layout
  return <ZomatoDashboard {...sharedProps} />;
};

export default PlatformRouter;
