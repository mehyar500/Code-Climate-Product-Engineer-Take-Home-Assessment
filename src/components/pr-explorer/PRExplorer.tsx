import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { PRTable } from './PRTable';
import { FilterPanel } from './FilterPanel';
import { useFilters } from '../../hooks/useFilters';
import { usePRData } from '../../hooks/usePRData';

export function PRExplorer() {
  const {
    filters,
    setDateRange,
    setStatus,
    setRepository,
    toggleAtRisk,
    resetFilters,
  } = useFilters();

  const { data, isLoading, isError, error } = usePRData(filters);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pull Request Explorer
        </Typography>

        <Paper sx={{ p: 2, mb: 2 }}>
          <FilterPanel
            filters={filters}
            onDateRangeChange={setDateRange}
            onStatusChange={setStatus}
            onRepositoryChange={setRepository}
            onAtRiskToggle={toggleAtRisk}
            onReset={resetFilters}
          />
        </Paper>

        {isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error instanceof Error ? error.message : 'An error occurred'}
          </Alert>
        )}

        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper>
            <PRTable data={data?.items ?? []} />
          </Paper>
        )}
      </Box>
    </Container>
  );
} 