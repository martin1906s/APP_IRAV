import type { ComponentType } from 'react';
import type { RequiredRole } from '../../infrastructure/api/sessionGuard';

/**
 * La sesión se valida solo en el login (App.tsx).
 * Este wrapper ya no revalida ni puede sacar al usuario.
 */
export function withScreenAuth<P extends object>(
  Screen: ComponentType<P>,
  _requiredRole?: RequiredRole,
  _mode?: 'focus' | 'mount',
) {
  return Screen;
}
