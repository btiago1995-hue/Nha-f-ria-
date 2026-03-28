import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { getDepartments } from './sectors';

const CompanyContext = createContext(null);

export const CompanyProvider = ({ profile, children }) => {
  const [company, setCompany]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchCompany = async () => {
    if (!profile?.company_id) { setLoading(false); return; }
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profile.company_id)
        .single();
      if (err) { setError(err); setCompany(null); }
      else setCompany(data || null);
    } catch (err) {
      setError(err);
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompany(); }, [profile?.company_id]);

  const departments = getDepartments(company?.sector);

  return (
    <CompanyContext.Provider value={{ company, departments, loading, error, refetch: fetchCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);
