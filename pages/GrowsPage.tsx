import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
} from '@mui/material';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import Toast from '../components/Toast';
import Loader from '../components/Loader';
import ErrorBanner from '../components/ErrorBanner';
import Button from '../components/Button';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import PlusIcon from '../components/icons/PlusIcon';
import useToast from '../hooks/useToast';
import { Grow } from '../types';

export default function GrowsPage() {
  const [grows, setGrows] = useState<Grow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, showToast] = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchData() {
      try {
        const { getGrows } = await import('../services/growService');
        const data = await getGrows();
        setGrows(data);
      } catch (e) {
        console.error('Erro ao buscar grows', e);
        setError(t('growsPage.error_load'));
        showToast({ message: t('growsPage.error_load'), type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [showToast, t]);

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100%"
        p={6}
      >
        <Loader message={t('growsPage.loading')} size="md" />
      </Box>
    );
  }
  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100%" p={6}>
        <ErrorBanner message={error} />
        <Button variant="secondary" onClick={() => window.location.reload()}>
          {t('growsPage.try_again')}
        </Button>
      </Box>
    );
  }
  return (
    <Box
      maxWidth="lg"
      mx="auto"
      width="100%"
      minHeight="100%"
      display="flex"
      flexDirection="column"
      gap={2}
      bgcolor="background.paper"
      p={{ xs: 2, sm: 4 }}
    >
      {toast && <Toast toast={toast} />}

      <Header
        title={t('growsPage.title')}
        showBack
        onBack={() => navigate(-1)}
        onOpenAddModal={() => navigate('/novo-grow')}
        onOpenScannerModal={() => {}}
      />

      <Breadcrumbs
        items={[
          { label: t('growsPage.breadcrumb.dashboard'), to: '/' },
          { label: t('growsPage.breadcrumb.grows') },
        ]}
        className="px-1 sm:px-0 mb-2"
      />

      <Typography variant="h4" color="primary" fontWeight="bold">
        {t('growsPage.title')}
      </Typography>

      <Box mt={3}>
        {grows.length ? (
          <List>
            {grows.map(g => (
              <ListItem key={g.id} sx={{ p: 0, mb: 1 }}>
                <Paper sx={{ p: 2, width: '100%' }} variant="outlined">
                  <Link to={`/grow/${g.id}`} style={{ textDecoration: 'none' }}>
                    <Typography fontWeight="bold" color="text.primary">
                      {g.name}
                    </Typography>
                    {g.location && (
                      <Typography variant="body2" color="text.secondary">
                        {g.location}
                      </Typography>
                    )}
                    {g.capacity && (
                      <Typography variant="body2" color="text.secondary">
                        {t('growsPage.capacity')}: {g.capacity}
                      </Typography>
                    )}
                  </Link>
                </Paper>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary" textAlign="center" py={4}>
            {t('growsPage.no_grows')}
            <br />
            <Link to="/novo-grow" style={{ textDecoration: 'underline', color: 'green' }}>
              {t('growsPage.create_first')}
            </Link>
          </Typography>
        )}
      </Box>
    </Box>
  );
}
