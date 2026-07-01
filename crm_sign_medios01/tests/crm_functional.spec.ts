import { test, expect } from '@playwright/test';

test.describe('Directorio Page', () => {
  test.beforeEach(async ({ page }) => {
    // We assume the app is running on localhost:5173 (standard for Vite)
    await page.goto('http://localhost:5173/directorio');
  });

  test('should display the Directorio page title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Directorio', exact: true })).toBeVisible();
  });

  test('should open the Add Contact modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Agregar Contacto' }).click();
    await expect(page.getByText('Agregar nuevo contacto')).toBeVisible();
  });

  test('should filter contacts by search', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Nombre, apellido o número...');
    await searchInput.fill('María');

    // Check if results are filtered (this depends on mock data)
    // Assuming 'María' exists in mock data
    await expect(page.getByText('María')).toBeVisible();

    await searchInput.fill('NonExistentContact');
    await expect(page.getByText('No hay contactos para mostrar')).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    await page.getByRole('button', { name: /Por Agentes/ }).click();
    await expect(page.getByText(/Por Agentes \(\d+\)/)).toHaveClass(/bg-blue-600/);

    await page.getByRole('button', { name: /Todos/ }).click();
    await expect(page.getByRole('button', { name: /Todos/ })).toHaveClass(/bg-blue-600/);
  });
});

test.describe('User Management Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/gestion-fichas');
  });

  test('should display User Management title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Gestión de Fichas', exact: true })).toBeVisible();
  });

  test('should open Add Record modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Añadir Ficha' }).click();
    await expect(page.getByText('Añadir Nueva Ficha')).toBeVisible();
  });
});

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/ajustes');
  });

  test('should display Settings title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Ajustes', exact: true })).toBeVisible();
  });

  test('should switch between settings tabs', async ({ page }) => {
    // Should start at backup tab
    await expect(page.getByText('Copias de seguridad')).toBeVisible();

    // Switch to Team tab
    await page.getByRole('button', { name: 'Equipo y permisos' }).click();
    await expect(page.getByText('Miembros del Equipo')).toBeVisible();

    // Switch back
    await page.getByRole('button', { name: 'Copias de seguridad' }).click();
    await expect(page.getByText('Historial de respaldos')).toBeVisible();
  });
});
