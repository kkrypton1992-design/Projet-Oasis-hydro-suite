import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../../src/components/common/ErrorBoundary';
import { DashboardView } from '../../src/components/dashboard/DashboardView';
import { HydraulicsView } from '../../src/components/hydraulics/HydraulicsView';
import { recalculateEntireProject } from '../../src/core/projectEngine';
import { DEFAULT_REAL_PROJECT } from '../../src/data/referenceProject';

describe('Critical UI components', () => {
  it('ErrorBoundary catches runtime exceptions and shows safe recovery UI', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const Broken = () => {
      throw new Error('Boom render failure');
    };

    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>
    );

    expect(screen.getByText(/OASIS HYDRO SUITE — Récupération Système/i)).toBeInTheDocument();
    expect(screen.getByText(/Boom render failure/)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('DashboardView displays real project KPIs and triggers navigation', () => {
    const project = recalculateEntireProject(DEFAULT_REAL_PROJECT);
    const setActiveTab = vi.fn();

    render(<DashboardView project={project} setActiveTab={setActiveTab} />);

    expect(screen.getByText(project.title)).toBeInTheDocument();
    expect(screen.getByText(project.code)).toBeInTheDocument();
    expect(screen.getByText('Ouvrages Modélisés')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Ouvrir la Carte SIG'));
    expect(setActiveTab).toHaveBeenCalledWith('gis');
  });

  it('HydraulicsView toggles longitudinal profile and updates material + Strickler K atomically', () => {
    const project = recalculateEntireProject(DEFAULT_REAL_PROJECT);
    const onUpdateStructure = vi.fn();

    render(<HydraulicsView project={project} onUpdateStructure={onUpdateStructure} />);

    fireEvent.click(screen.getByText(/Profil en Long/i));
    expect(screen.getByText(/Ligne de charge H/i)).toBeInTheDocument();

    const materialSelect = screen.getByDisplayValue(/Béton armé/i);
    fireEvent.change(materialSelect, { target: { value: 'HDPE' } });

    expect(onUpdateStructure).toHaveBeenCalledTimes(1);
    const updatedStruct = onUpdateStructure.mock.calls[0][0];
    expect(updatedStruct.material).toBe('HDPE');
    expect(updatedStruct.stricklerK).toBe(80);
    expect(updatedStruct.results).toBeDefined();
  });
});
