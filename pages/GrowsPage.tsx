import React, { useState, useEffect } from 'react';
import { Grow } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import PlusIcon from '../components/icons/PlusIcon';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Loader from '../components/Loader';
import {
  Box,
  Typography,
  Breadcrumbs,
  Paper,
  IconButton,
  List,
  ListItem,
} from '@mui/material';

export default function GrowsPage() {
  const [grows, setGrows] = useState<Grow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, showToast] = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const { getGrows } = await import('../services/growService');
        const data = await getGrows();
        setGrows(data);
      } catch (e) {
        console.error('Erro ao buscar grows', e);
        showToast({ message: 'Erro ao carregar grows', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
        <Loader message="Carregando estufas..." size="md" />
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
      {toast && <Toast message={toast.message} type={toast.type} />}

      <Box
        position="sticky"
        top={0}
        zIndex={20}
        bgcolor="background.paper"
        display="flex"
        alignItems="center"
        gap={1}
        py={1}
        px={{ xs: 1, sm: 0 }}
        mb={2}
        sx={{ backdropFilter: 'blur(4px)' }}
      >
        <IconButton onClick={() => navigate(-1)} aria-label="Voltar" color="primary">
          <ArrowLeftIcon className="w-7 h-7" />
        </IconButton>
        <Breadcrumbs separator=">">
          <Link to="/">Dashboard</Link>
          <Typography color="text.primary">Grows</Typography>
        </Breadcrumbs>
        <Box flexGrow={1} />
        <Link to="/novo-grow">
          <Button variant="primary" size="icon" title="Novo Grow">
            <PlusIcon className="w-5 h-5" />
          </Button>
        </Link>
      </Box>

      <Typography variant="h4" color="primary" fontWeight="bold">
        Meus Grows
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
                        Capacidade: {g.capacity}
                      </Typography>
                    )}
                  </Link>
                </Paper>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary" textAlign="center" py={4}>
            Nenhum grow cadastrado ainda.
            <br />
            <Link to="/novo-grow">Crie sua primeira estufa</Link>
          </Typography>
        )}
      </Box>
    </Box>
  );
}
