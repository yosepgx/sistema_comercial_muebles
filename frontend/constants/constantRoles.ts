export const ROLES = {
  ADMIN: 'administrador',
  VENDEDOR: 'vendedor',
  LOGISTICA: 'logistica',
} as const;

export const GRUPO_ID_TO_ROLE = {
  1: ROLES.ADMIN,
  2: ROLES.VENDEDOR,
  3: ROLES.LOGISTICA,
} as const;

export type RolUsuario = typeof ROLES[keyof typeof ROLES];

export const PERMISOS = {
  // USUARIOS Y PERMISOS
  usuario_crear: [ROLES.ADMIN],
  usuario_leer: [ROLES.ADMIN],
  usuario_actualizar: [ROLES.ADMIN],
  usuario_eliminar: [ROLES.ADMIN],

  grupo_crear: [ROLES.ADMIN],
  grupo_leer: [ROLES.ADMIN],
  grupo_actualizar: [ROLES.ADMIN],
  grupo_eliminar: [ROLES.ADMIN],

  permiso_leer: [ROLES.ADMIN],
  sesion_leer: [ROLES.ADMIN],
  configurarSistema: [ROLES.ADMIN], // Podria descomponerlo mas

  // REGLAS DE DESCUENTO
  regla_descuento_crear: [ROLES.ADMIN],
  regla_descuento_leer: [ROLES.ADMIN],
  regla_descuento_actualizar: [ROLES.ADMIN],
  regla_descuento_eliminar: [ROLES.ADMIN],

  // CATEGORÍAS
  categoria_crear: [ROLES.ADMIN],
  categoria_leer: [ROLES.ADMIN],
  categoria_actualizar: [ROLES.ADMIN],
  categoria_eliminar: [ROLES.ADMIN],

  // PRODUCTOS
  producto_crear: [ROLES.ADMIN],
  producto_leer: [ROLES.ADMIN, ROLES.LOGISTICA],
  producto_actualizar: [ROLES.ADMIN],
  producto_eliminar: [ROLES.ADMIN],

  // PRECIOS
  precio_actualizar: [ROLES.ADMIN],

  // INVENTARIO
  inventario_leer: [ROLES.ADMIN, ROLES.LOGISTICA],
  inventario_actualizar: [ROLES.ADMIN, ROLES.LOGISTICA],

  // OPORTUNIDADES Y COTIZACIONES
  oportunidad_crear: [ROLES.ADMIN, ROLES.VENDEDOR],

  cotizacion_crear: [ROLES.ADMIN, ROLES.VENDEDOR],
  cotizacion_leer: [ROLES.ADMIN, ROLES.VENDEDOR],
  cotizacion_actualizar: [ROLES.ADMIN, ROLES.VENDEDOR],
  cotizacion_eliminar: [ROLES.ADMIN],

  // PEDIDOS
  pedido_crear: [ROLES.ADMIN, ROLES.VENDEDOR],
  pedido_leer_todos: [ROLES.ADMIN],
  pedido_leer_mios: [ROLES.ADMIN, ROLES.VENDEDOR],
  pedido_despachar: [ROLES.ADMIN, ROLES.LOGISTICA],

  // CLIENTES
  cliente_crear: [ROLES.ADMIN, ROLES.VENDEDOR],
  cliente_leer: [ROLES.ADMIN, ROLES.VENDEDOR],
  cliente_actualizar: [ROLES.ADMIN, ROLES.VENDEDOR],
  cliente_eliminar: [ROLES.ADMIN],
};