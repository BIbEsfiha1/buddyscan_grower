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
import Button from '../components/Button';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import PlusIcon from '../components/icons/PlusIcon';
import useToast from '../hooks/useToast';
import { Grow } from '../types';

export default function GrowsPage() {
  const [grows, setGrows] = useState<Grow[]>([]);
  const [loading, setLoading] = useState(true);
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
