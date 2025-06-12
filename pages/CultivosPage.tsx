import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import { Cultivo } from '../types';
import Button from '../components/Button';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import Toast from '../components/Toast';
import LeafIcon from '../components/icons/LeafIcon';
import Loader from '../components/Loader';
import ErrorBanner from '../components/ErrorBanner';
import { getCultivos } from '../services/cultivoService';

const CultivosPage: React.FC = () => {
  const { t } = useTranslation();
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function fetchCultivos() {
      try {
        const data = await getCultivos();
        if (mounted) setCultivos(data);
      } catch {
        setError(t('cultivosPage.error_loading'));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchCultivos();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (loading)
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" p={3}>
        <Loader message={t('cultivosPage.loading')} size="md" />
      </Box>
    );
  if (error)
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" p={3}>
        <ErrorBanner message={error} />
        <Button variant="secondary" onClick={() => window.location.reload()}>
          {t('cultivosPage.try_again')}
        </Button>
      </Box>
    );

  const hasCultivos = cultivos.length > 0;

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      {toast && <Toast toast={toast} />}

      <Header
        title={t('sidebar.cultivos')}
        onOpenSidebar={() => {}}
        onOpenAddModal={() => navigate('/novo-cultivo')}
        onOpenScannerModal={() => {}}
        showBack
        onBack={() => navigate(-1)}
      />
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/' },
          { label: t('sidebar.cultivos') },
        ]}
        className="mb-2"
      />

      <Typography variant="h5" fontWeight="bold" color="primary.main" sx={{ mt: 3, mb: 2 }}>
        {hasCultivos ? t('cultivosPage.title_with_count', { count: cultivos.length }) : t('cultivosPage.title')}
      </Typography>

      {hasCultivos ? (
        <Grid container spacing={2}>
          {cultivos.map(cultivo => (
            <Grid item xs={12} key={cultivo.id}>
              <Paper
                component={Link}
                to={`/cultivo/${cultivo.id}`}
                sx={{
                  display: 'block',
                  p: 2,
                  textDecoration: 'none',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 3,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Typography variant="subtitle1" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cultivo.name}
                  </Typography>
                  {cultivo.finalizadoEm && (
                    <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                      {t('cultivosPage.finalizado')}
                    </Typography>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {t('cultivosPage.inicio')}: {new Date(cultivo.startDate).toLocaleDateString()}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('cultivosPage.no_cultivos')}</Typography>
          <Button variant="primary" sx={{ mt: 2 }} onClick={() => navigate('/novo-cultivo')}>
            {t('cultivosPage.create_first')}
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default CultivosPage;
