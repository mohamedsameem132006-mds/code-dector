import React, { useState, useEffect } from 'react';
import { Database, Table, RefreshCw, Layers, CheckCircle2, Search } from 'lucide-react';
import { apiService } from '../services/api';
import { useSettings } from '../context/SettingsContext';

export default function DatabaseViewerPage() {
  const { theme } = useSettings();
  const isDark = theme === 'dark';

  const [tables, setTables] = useState([]);
  const [counts, setCounts] = useState({});
  const [selectedTable, setSelectedTable] = useState('analyses');
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      loadTableData(selectedTable);
    }
  }, [selectedTable]);

  const loadTables = async () => {
    try {
      setLoading(true);
      const res = await apiService.getDatabaseTables();
      setTables(res.data.tables || []);
      setCounts(res.data.counts || {});
      if (res.data.tables?.length && !res.data.tables.includes(selectedTable)) {
        setSelectedTable(res.data.tables[0]);
      }
    } catch (err) {
      console.error('Failed to load tables:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTableData = async (table) => {
    try {
      setTableLoading(true);
      const res = await apiService.getTableData(table);
      setColumns(res.data.columns || []);
      setRows(res.data.rows || []);
    } catch (err) {
      console.error('Failed to load table data:', err);
    } finally {
      setTableLoading(false);
    }
  };

  const filteredRows = rows.filter(r => {
    if (!searchTerm) return true;
    return JSON.stringify(r).toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Database Explorer
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-mono font-medium border border-indigo-500/20">
              Cloud Firestore
            </span>
          </div>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Live inspection of persisted collections in Firebase Cloud Firestore.
          </p>
        </div>

        <button
          onClick={() => { loadTables(); loadTableData(selectedTable); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
            isDark 
              ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800' 
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${tableLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Table Selector Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {tables.map(tbl => (
          <button
            key={tbl}
            onClick={() => setSelectedTable(tbl)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition border ${
              selectedTable === tbl
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                : isDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span className="font-mono">{tbl}</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ${
              selectedTable === tbl 
                ? 'bg-indigo-700 text-white' 
                : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
            }`}>
              {counts[tbl] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Table Data Viewer Container */}
      <div className={`border rounded-2xl overflow-hidden shadow-xl transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Table Search & Meta Header */}
        <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              SELECT * FROM `{selectedTable}`
            </span>
            <span className="text-xs text-slate-400">
              ({filteredRows.length} rows)
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search table rows..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none focus:border-indigo-500 ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-800'
              }`}
            />
          </div>
        </div>

        {/* Data Grid */}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          {tableLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Querying Firestore collection `{selectedTable}`...</p>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Table className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">No rows found in `{selectedTable}`</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-100'}`}>
                  {columns.map(col => (
                    <th key={col.name} className={`px-4 py-3 font-mono font-semibold whitespace-nowrap ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {col.name}
                      <span className="text-[10px] text-slate-500 block font-normal">{col.type}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                {filteredRows.map((row, rIdx) => (
                  <tr key={rIdx} className={`transition ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                    {columns.map(col => {
                      const val = row[col.name];
                      const valStr = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? 'NULL');
                      return (
                        <td key={col.name} className={`px-4 py-3 max-w-xs truncate font-mono ${
                          val === null 
                            ? 'text-slate-500 italic' 
                            : isDark ? 'text-slate-300' : 'text-slate-800'
                        }`} title={valStr}>
                          {valStr}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
