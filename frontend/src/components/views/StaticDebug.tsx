import React, { useState } from 'react';
import { useAuth } from '../../AuthContext';
import { getProfile, getMeals, getUserGoals } from '../../utils/database';
import { testSupabaseConnection } from '../../utils/testSupabase';
import { checkDatabaseSchema } from '../../utils/checkDatabaseSchema';

export const StaticDebug: React.FC = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDebugTest = async () => {
    if (!user) {
      setError('No user found');
      return;
    }

    try {
      console.log('🔍 Starting debug test...');
      setLoading(true);
      setError(null);
      
      const results: any = {
        timestamp: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email
        }
      };

      // Test 1: Supabase Connection
      console.log('🔌 Testing Supabase connection...');
      const connectionTest = await testSupabaseConnection();
      results.connectionTest = connectionTest;
      console.log('✅ Connection test complete:', connectionTest);

      // Test 2: Database Schema
      console.log('📊 Checking database schema...');
      const schemaCheck = await checkDatabaseSchema();
      results.schemaCheck = schemaCheck;
      console.log('✅ Schema check complete:', schemaCheck);

      // Test 3: Data Fetching
      if (connectionTest.success) {
        console.log('📥 Fetching user data...');
        const [profile, meals, goals] = await Promise.all([
          getProfile(user.id),
          getMeals(user.id),
          getUserGoals(user.id)
        ]);

        results.data = {
          profile,
          meals: {
            count: meals.length,
            sample: meals.slice(0, 2)
          },
          goals: {
            count: goals.length,
            sample: goals.slice(0, 2)
          }
        };
        console.log('✅ Data fetch complete');
      }

      setDebugInfo(results);
      console.log('🎉 Debug test complete!');
    } catch (err) {
      console.error('❌ Debug test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Profile Debug Information</h1>
            <button
              onClick={runDebugTest}
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Running...' : 'Run Debug Test'}
            </button>
          </div>
          
          {!debugInfo && !loading && !error && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Click "Run Debug Test" to start debugging</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Running debug tests...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {debugInfo && (
            <div className="space-y-4">
              {/* Connection Status */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">🔌 Supabase Connection</h3>
                <div className="text-sm">
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      debugInfo?.connectionTest?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {debugInfo?.connectionTest?.success ? '✅ Connected' : '❌ Failed'}
                    </span>
                  </p>
                  {debugInfo?.connectionTest?.session && (
                    <p><strong>Session:</strong> {debugInfo.connectionTest.session ? '✅ Active' : '❌ None'}</p>
                  )}
                  {debugInfo?.connectionTest?.tables && (
                    <div className="mt-2">
                      <p><strong>Tables:</strong></p>
                      <ul className="ml-4 space-y-1">
                        {Object.entries(debugInfo.connectionTest.tables).map(([table, exists]) => (
                          <li key={table} className="text-xs">
                            {table}: {exists ? '✅' : '❌'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Schema Check */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">📊 Database Schema</h3>
                <div className="text-sm space-y-1">
                  {debugInfo?.schemaCheck && Object.entries(debugInfo.schemaCheck).map(([table, info]: [string, any]) => (
                    <div key={table} className="flex items-center gap-2">
                      <span className="font-medium">{table}:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        info.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {info.exists ? '✅ Exists' : '❌ Missing'}
                      </span>
                      {info.error && <span className="text-red-600 text-xs">({info.error})</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* User Data */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">👤 User Data</h3>
                <div className="text-sm space-y-1">
                  <p><strong>ID:</strong> {debugInfo?.user?.id || 'N/A'}</p>
                  <p><strong>Email:</strong> {debugInfo?.user?.email || 'N/A'}</p>
                  <p><strong>Profile:</strong> {debugInfo?.data?.profile ? '✅ Found' : '❌ Missing'}</p>
                  <p><strong>Meals:</strong> {debugInfo?.data?.meals?.count || 0} entries</p>
                  <p><strong>Goals:</strong> {debugInfo?.data?.goals?.count || 0} entries</p>
                </div>
              </div>

              {/* Raw Data */}
              <details className="p-4 bg-gray-50 rounded-lg">
                <summary className="font-semibold text-gray-900 cursor-pointer">🔍 Raw Debug Data</summary>
                <pre className="mt-2 text-xs bg-white p-3 rounded border overflow-auto max-h-96">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
