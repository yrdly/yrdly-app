"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createUISpan, createAPISpan, logInfo, logError } from '@/lib/sentry';
import * as Sentry from '@sentry/nextjs';

export function SentryExampleComponent() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  // Example of UI interaction tracing
  const handleButtonClick = () => {
    createUISpan(
      'Example Button Click',
      'ui.click',
      (span) => {
        span.setAttribute('button_id', 'example-button');
        span.setAttribute('user_action', 'click');
        span.setAttribute('timestamp', new Date().toISOString());
        
        // Log the action
        logInfo('Button clicked', {
          buttonId: 'example-button',
          timestamp: new Date().toISOString()
        });
        
        // Simulate some work
        setTimeout(() => {
          span.setAttribute('duration', '100ms');
          span.setAttribute('status', 'completed');
        }, 100);
      }
    );
  };

  // Example of API call tracing
  const handleApiCall = async () => {
    setLoading(true);
    
    try {
      await createAPISpan(
        'GET /api/example',
        'http.client',
        async (span) => {
          span.setAttribute('method', 'GET');
          span.setAttribute('url', '/api/example');
          span.setAttribute('user_id', 'example-user');
          
          // Log the API call start
          logInfo('API call started', {
            endpoint: '/api/example',
            method: 'GET'
          });
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Simulate successful response
          const mockData = { id: 1, name: 'Example Data' };
          setData(mockData);
          
          span.setAttribute('status_code', 200);
          span.setAttribute('response_time', '1000ms');
          span.setAttribute('response_size', JSON.stringify(mockData).length);
          
          // Log successful response
          logInfo('API call completed', {
            endpoint: '/api/example',
            statusCode: 200,
            responseTime: '1000ms'
          });
        }
      );
    } catch (error) {
      // Log and capture the error
      logError('API call failed', {
        endpoint: '/api/example',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  // Example of error handling with Sentry
  const handleError = () => {
    try {
      // This will throw an error
      const result = JSON.parse('invalid json');
      console.log(result);
    } catch (error) {
      // Log the error
      logError('JSON parsing failed', {
        input: 'invalid json',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Capture the exception
      Sentry.captureException(error, {
        tags: {
          error_type: 'json_parsing',
          component: 'SentryExampleComponent'
        },
        extra: {
          input: 'invalid json',
          timestamp: new Date().toISOString()
        }
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sentry Integration Examples</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button onClick={handleButtonClick} className="w-full">
            Test UI Interaction Tracing
          </Button>
          <p className="text-sm text-muted-foreground">
            Click to test UI interaction tracing with spans and logging
          </p>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={handleApiCall} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Loading...' : 'Test API Call Tracing'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Click to test API call tracing with performance metrics
          </p>
          {data && (
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
              ✅ API call successful: {JSON.stringify(data)}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Button onClick={handleError} variant="destructive" className="w-full">
            Test Error Handling
          </Button>
          <p className="text-sm text-muted-foreground">
            Click to test error capture and logging
          </p>
        </div>

        <div className="text-xs text-muted-foreground">
          Check your Sentry dashboard to see the captured events, spans, and logs.
        </div>
      </CardContent>
    </Card>
  );
}
