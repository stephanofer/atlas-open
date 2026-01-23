/**
 * Debug utilities for Atlas
 * 
 * Enable debugging by setting localStorage.setItem('atlas:debug', 'true')
 * Disable with localStorage.removeItem('atlas:debug')
 * 
 * Debug specific modules:
 * - localStorage.setItem('atlas:debug', 'auth,query,supabase')
 */

type DebugModule = 'auth' | 'query' | 'supabase' | 'animation' | 'session' | 'all';

interface DebugConfig {
  enabled: boolean;
  modules: Set<DebugModule>;
  showTimestamps: boolean;
  showStackTrace: boolean;
}

const config: DebugConfig = {
  enabled: false,
  modules: new Set(['all']),
  showTimestamps: true,
  showStackTrace: false,
};

// Initialize from localStorage
if (typeof window !== 'undefined') {
  const debugValue = localStorage.getItem('atlas:debug');
  if (debugValue) {
    config.enabled = true;
    if (debugValue !== 'true') {
      config.modules = new Set(debugValue.split(',') as DebugModule[]);
    }
  }
}

// Color palette for different modules
const colors: Record<DebugModule | string, string> = {
  auth: '#22c55e',      // green
  query: '#3b82f6',     // blue  
  supabase: '#f59e0b',  // amber
  animation: '#a855f7', // purple
  session: '#ec4899',   // pink
  all: '#64748b',       // slate
};

// Emoji for different log types
const icons = {
  info: 'i',
  warn: '!',
  error: 'X',
  success: '+',
  start: '>',
  end: '<',
  timer: '#',
};

function shouldLog(module: DebugModule): boolean {
  if (!config.enabled) return false;
  if (config.modules.has('all')) return true;
  return config.modules.has(module);
}

function formatTime(): string {
  if (!config.showTimestamps) return '';
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
}

function createLogger(module: DebugModule) {
  const color = colors[module] || colors.all;
  const prefix = `%c[${module.toUpperCase()}]`;
  const style = `color: ${color}; font-weight: bold;`;
  const timeStyle = 'color: #64748b; font-size: 10px;';
  
  return {
    log: (message: string, ...args: unknown[]) => {
      if (!shouldLog(module)) return;
      const time = formatTime();
      console.log(`${time ? `%c${time} ` : ''}${prefix}`, ...(time ? [timeStyle, style] : [style]), `${icons.info} ${message}`, ...args);
    },
    
    warn: (message: string, ...args: unknown[]) => {
      if (!shouldLog(module)) return;
      const time = formatTime();
      console.warn(`${time ? `%c${time} ` : ''}${prefix}`, ...(time ? [timeStyle, style] : [style]), `${icons.warn} ${message}`, ...args);
    },
    
    error: (message: string, ...args: unknown[]) => {
      if (!shouldLog(module)) return;
      const time = formatTime();
      console.error(`${time ? `%c${time} ` : ''}${prefix}`, ...(time ? [timeStyle, style] : [style]), `${icons.error} ${message}`, ...args);
      if (config.showStackTrace) {
        console.trace();
      }
    },
    
    success: (message: string, ...args: unknown[]) => {
      if (!shouldLog(module)) return;
      const time = formatTime();
      console.log(`${time ? `%c${time} ` : ''}${prefix}`, ...(time ? [timeStyle, style] : [style]), `${icons.success} ${message}`, ...args);
    },
    
    group: (label: string) => {
      if (!shouldLog(module)) return { end: () => {} };
      const time = formatTime();
      console.group(`${time ? `${time} ` : ''}[${module.toUpperCase()}] ${icons.start} ${label}`);
      const startTime = performance.now();
      return {
        end: (result?: unknown) => {
          const duration = performance.now() - startTime;
          if (result !== undefined) {
            console.log(`Result:`, result);
          }
          console.log(`%c${icons.timer} Duration: ${duration.toFixed(2)}ms`, 'color: #64748b');
          console.groupEnd();
        }
      };
    },
    
    time: (label: string) => {
      if (!shouldLog(module)) return { end: () => {} };
      const startTime = performance.now();
      return {
        end: () => {
          const duration = performance.now() - startTime;
          const time = formatTime();
          console.log(`${time ? `%c${time} ` : ''}${prefix}`, ...(time ? [timeStyle, style] : [style]), `${icons.timer} ${label}: ${duration.toFixed(2)}ms`);
        }
      };
    },
    
    table: (data: unknown) => {
      if (!shouldLog(module)) return;
      console.table(data);
    },
  };
}

// Export loggers for each module
export const debugAuth = createLogger('auth');
export const debugQuery = createLogger('query');
export const debugSupabase = createLogger('supabase');
export const debugAnimation = createLogger('animation');
export const debugSession = createLogger('session');

// Utility to enable/disable debugging from console
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).atlasDebug = {
    enable: (modules?: string) => {
      localStorage.setItem('atlas:debug', modules || 'true');
      config.enabled = true;
      if (modules) {
        config.modules = new Set(modules.split(',') as DebugModule[]);
      } else {
        config.modules = new Set(['all']);
      }
      console.log('%c[ATLAS DEBUG] Enabled', 'color: #22c55e; font-weight: bold;', 
        modules ? `for modules: ${modules}` : 'for all modules');
      console.log('Reload the page to see debug logs');
    },
    disable: () => {
      localStorage.removeItem('atlas:debug');
      config.enabled = false;
      console.log('%c[ATLAS DEBUG] Disabled', 'color: #ef4444; font-weight: bold;');
    },
    status: () => {
      console.log('%c[ATLAS DEBUG] Status', 'color: #3b82f6; font-weight: bold;');
      console.table({
        enabled: config.enabled,
        modules: Array.from(config.modules).join(', '),
        showTimestamps: config.showTimestamps,
      });
    },
    showStack: (show: boolean) => {
      config.showStackTrace = show;
      console.log('%c[ATLAS DEBUG] Stack traces:', 'color: #3b82f6; font-weight: bold;', show ? 'enabled' : 'disabled');
    }
  };
  
  // Log instructions on load (only in dev)
  if (import.meta.env.DEV && !config.enabled) {
    console.log(
      '%c[ATLAS] Debug mode available. Run atlasDebug.enable() in console to activate.',
      'color: #64748b; font-style: italic;'
    );
  }
}

// Query performance tracker
interface QueryMetric {
  queryKey: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'pending' | 'success' | 'error';
  error?: unknown;
}

const queryMetrics = new Map<string, QueryMetric[]>();

export const queryTracker = {
  start: (queryKey: string) => {
    if (!config.enabled) return;
    const metric: QueryMetric = {
      queryKey,
      startTime: performance.now(),
      status: 'pending',
    };
    const existing = queryMetrics.get(queryKey) || [];
    existing.push(metric);
    queryMetrics.set(queryKey, existing);
    debugQuery.log(`Query started: ${queryKey}`);
    return metric;
  },
  
  end: (queryKey: string, status: 'success' | 'error', error?: unknown) => {
    if (!config.enabled) return;
    const metrics = queryMetrics.get(queryKey);
    if (!metrics?.length) return;
    const metric = metrics[metrics.length - 1];
    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.status = status;
    metric.error = error;
    
    if (status === 'error') {
      debugQuery.error(`Query failed: ${queryKey}`, { duration: `${metric.duration.toFixed(2)}ms`, error });
    } else {
      const durationStyle = metric.duration > 1000 ? 'color: #ef4444' : metric.duration > 500 ? 'color: #f59e0b' : 'color: #22c55e';
      debugQuery.log(`Query completed: ${queryKey} %c(${metric.duration.toFixed(2)}ms)`, durationStyle);
    }
  },
  
  getMetrics: () => {
    const result: Record<string, { count: number; avgDuration: number; errors: number }> = {};
    queryMetrics.forEach((metrics, key) => {
      const completed = metrics.filter(m => m.duration);
      const errors = metrics.filter(m => m.status === 'error').length;
      const totalDuration = completed.reduce((sum, m) => sum + (m.duration || 0), 0);
      result[key] = {
        count: metrics.length,
        avgDuration: completed.length ? totalDuration / completed.length : 0,
        errors,
      };
    });
    return result;
  },
  
  logMetrics: () => {
    console.log('%c[ATLAS] Query Metrics', 'color: #3b82f6; font-weight: bold;');
    console.table(queryTracker.getMetrics());
  },
  
  clear: () => {
    queryMetrics.clear();
  },
};

// Session state tracker
interface SessionState {
  timestamp: number;
  event: string;
  data?: unknown;
}

const sessionHistory: SessionState[] = [];

export const sessionTracker = {
  log: (event: string, data?: unknown) => {
    const state: SessionState = {
      timestamp: Date.now(),
      event,
      data,
    };
    sessionHistory.push(state);
    debugSession.log(event, data);
    
    // Keep only last 50 events
    if (sessionHistory.length > 50) {
      sessionHistory.shift();
    }
  },
  
  getHistory: () => sessionHistory,
  
  logHistory: () => {
    console.log('%c[ATLAS] Session History', 'color: #ec4899; font-weight: bold;');
    console.table(sessionHistory.map(s => ({
      time: new Date(s.timestamp).toLocaleTimeString(),
      event: s.event,
      data: JSON.stringify(s.data).slice(0, 100),
    })));
  },
  
  clear: () => {
    sessionHistory.length = 0;
  },
};

// Add to window for console access
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).atlasDebug = {
    ...(window as unknown as Record<string, unknown>).atlasDebug as object,
    queries: queryTracker,
    session: sessionTracker,
  };
}
