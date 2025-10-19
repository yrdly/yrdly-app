import * as Sentry from "@sentry/nextjs";

// Get the logger for structured logging
const { logger } = Sentry;

// Sentry utility functions for better error tracking and user context

/**
 * Set user context for better error tracking
 */
export const setUserContext = (user: {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
}) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
    // Don't include sensitive data like passwords
  });
  
  // Set additional context
  Sentry.setContext("user", {
    id: user.id,
    name: user.name,
    avatar_url: user.avatar_url,
  });
};

/**
 * Clear user context on logout
 */
export const clearUserContext = () => {
  Sentry.setUser(null);
  Sentry.setContext("user", null);
};

/**
 * Track user actions as breadcrumbs
 */
export const trackUserAction = (action: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message: action,
    category: 'user-action',
    data: data,
    level: 'info',
    timestamp: Date.now() / 1000,
  });
};

/**
 * Track API errors with context
 */
export const trackApiError = (error: Error, context: {
  endpoint: string;
  method: string;
  userId?: string;
  requestData?: any;
}) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'api_error');
    scope.setContext('api_request', {
      endpoint: context.endpoint,
      method: context.method,
      userId: context.userId,
      requestData: context.requestData,
    });
    
    Sentry.captureException(error);
  });
};

/**
 * Track component errors with context
 */
export const trackComponentError = (error: Error, context: {
  component: string;
  userId?: string;
  props?: any;
}) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'component_error');
    scope.setContext('component', {
      name: context.component,
      userId: context.userId,
      props: context.props,
    });
    
    Sentry.captureException(error);
  });
};

/**
 * Track performance metrics
 */
export const trackPerformance = (name: string, duration: number, context?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message: `Performance: ${name}`,
    category: 'performance',
    data: {
      duration,
      ...context,
    },
    level: 'info',
    timestamp: Date.now() / 1000,
  });
};

/**
 * Track feature usage
 */
export const trackFeatureUsage = (feature: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message: `Feature used: ${feature}`,
    category: 'feature_usage',
    data: data,
    level: 'info',
    timestamp: Date.now() / 1000,
  });
};

/**
 * Track custom events
 */
export const trackEvent = (eventName: string, data?: Record<string, any>) => {
  Sentry.captureMessage(eventName, {
    level: 'info',
    tags: {
      event_type: 'custom_event',
    },
    extra: data,
  });
};

/**
 * Track database errors
 */
export const trackDatabaseError = (error: Error, context: {
  operation: string;
  table?: string;
  userId?: string;
  query?: string;
}) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'database_error');
    scope.setContext('database', {
      operation: context.operation,
      table: context.table,
      userId: context.userId,
      query: context.query,
    });
    
    Sentry.captureException(error);
  });
};

/**
 * Track authentication errors
 */
export const trackAuthError = (error: Error, context: {
  action: string;
  userId?: string;
  provider?: string;
}) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'auth_error');
    scope.setContext('authentication', {
      action: context.action,
      userId: context.userId,
      provider: context.provider,
    });
    
    Sentry.captureException(error);
  });
};

/**
 * Track real-time errors
 */
export const trackRealtimeError = (error: Error, context: {
  channel: string;
  event: string;
  userId?: string;
}) => {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'realtime_error');
    scope.setContext('realtime', {
      channel: context.channel,
      event: context.event,
      userId: context.userId,
    });
    
    Sentry.captureException(error);
  });
};

/**
 * Create a span for UI interactions
 */
export const createUISpan = (name: string, op: string, callback: (span: any) => void) => {
  return Sentry.startSpan(
    {
      op: op,
      name: name,
    },
    callback
  );
};

/**
 * Create a span for API calls
 */
export const createAPISpan = (name: string, op: string, callback: (span: any) => void) => {
  return Sentry.startSpan(
    {
      op: op,
      name: name,
    },
    callback
  );
};

/**
 * Structured logging functions
 */
export const logTrace = (message: string, data?: Record<string, any>) => {
  logger.trace(message, data);
};

export const logDebug = (message: string, data?: Record<string, any>) => {
  logger.debug(message, data);
};

export const logInfo = (message: string, data?: Record<string, any>) => {
  logger.info(message, data);
};

export const logWarn = (message: string, data?: Record<string, any>) => {
  logger.warn(message, data);
};

export const logError = (message: string, data?: Record<string, any>) => {
  logger.error(message, data);
};

export const logFatal = (message: string, data?: Record<string, any>) => {
  logger.fatal(message, data);
};

/**
 * Template literal logging with variables
 */
export const logDebugFmt = (template: TemplateStringsArray, ...values: any[]) => {
  logger.debug(logger.fmt(template, ...values));
};

export const logInfoFmt = (template: TemplateStringsArray, ...values: any[]) => {
  logger.info(logger.fmt(template, ...values));
};

export const logWarnFmt = (template: TemplateStringsArray, ...values: any[]) => {
  logger.warn(logger.fmt(template, ...values));
};

export const logErrorFmt = (template: TemplateStringsArray, ...values: any[]) => {
  logger.error(logger.fmt(template, ...values));
};
