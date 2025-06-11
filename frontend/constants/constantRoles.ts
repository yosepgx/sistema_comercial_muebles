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
  producto_leer: [ROLES.ADMIN],
  producto_actualizar: [ROLES.ADMIN],
  producto_eliminar: [ROLES.ADMIN],

  // PRECIOS
  precio_actualizar: [ROLES.ADMIN],

  // INVENTARIO
  inventario_leer: [ROLES.ADMIN, ROLES.LOGISTICA],
  inventario_actualizar: [ROLES.ADMIN, ROLES.LOGISTICA],

  // OPORTUNIDADES Y COTIZACIONES
  oportunidad_crear: [ROLES.ADMIN, ROLES.VENDEDOR],
  oportunidad_leer: [ROLES.ADMIN, ROLES.VENDEDOR],
  oportunidad_actualizar: [ROLES.ADMIN, ROLES.VENDEDOR],
  oportunidad_eliminar: [ROLES.ADMIN],

  cotizacion_crear: [ROLES.ADMIN, ROLES.VENDEDOR],
  cotizacion_leer: [ROLES.ADMIN, ROLES.VENDEDOR],
  cotizacion_actualizar: [ROLES.ADMIN, ROLES.VENDEDOR],
  cotizacion_eliminar: [ROLES.ADMIN],
  cotizacion_exportar: [ROLES.ADMIN],

  // PEDIDOS
  pedido_crear: [ROLES.ADMIN], //no se usa se hace por back
  pedido_leer_todos: [ROLES.ADMIN, ROLES.VENDEDOR],
  //pedido_eliminar: [ROLES.ADMIN], //no hay
  //pedido_actualizar : [ROLES.ADMIN], no hay
  pedido_despachar: [ROLES.ADMIN],
  notas_crear: [ROLES.ADMIN],

  // CLIENTES
  cliente_crear: [ROLES.ADMIN, ROLES.VENDEDOR],
  cliente_leer: [ROLES.ADMIN, ROLES.VENDEDOR],
  cliente_actualizar: [ROLES.ADMIN, ROLES.VENDEDOR],
  cliente_eliminar: [ROLES.ADMIN],
};

// constants/permissionKeys.ts
export const PERMISSION_KEYS = {
  // USUARIOS Y PERMISOS
  USUARIO_CREAR: 'usuario_crear',
  USUARIO_LEER: 'usuario_leer',
  USUARIO_ACTUALIZAR: 'usuario_actualizar',
  USUARIO_ELIMINAR: 'usuario_eliminar',

  GRUPO_CREAR: 'grupo_crear',
  GRUPO_LEER: 'grupo_leer',
  GRUPO_ACTUALIZAR: 'grupo_actualizar',
  GRUPO_ELIMINAR: 'grupo_eliminar',

  PERMISO_LEER: 'permiso_leer',
  SESION_LEER: 'sesion_leer',
  CONFIGURAR_SISTEMA: 'configurarSistema',

  // REGLAS DE DESCUENTO
  REGLA_DESCUENTO_CREAR: 'regla_descuento_crear',
  REGLA_DESCUENTO_LEER: 'regla_descuento_leer',
  REGLA_DESCUENTO_ACTUALIZAR: 'regla_descuento_actualizar',
  REGLA_DESCUENTO_ELIMINAR: 'regla_descuento_eliminar',

  // CATEGORÍAS
  CATEGORIA_CREAR: 'categoria_crear',
  CATEGORIA_LEER: 'categoria_leer',
  CATEGORIA_ACTUALIZAR: 'categoria_actualizar',
  CATEGORIA_ELIMINAR: 'categoria_eliminar',

  // PRODUCTOS
  PRODUCTO_CREAR: 'producto_crear',
  PRODUCTO_LEER: 'producto_leer',
  PRODUCTO_ACTUALIZAR: 'producto_actualizar',
  PRODUCTO_ELIMINAR: 'producto_eliminar',

  // PRECIOS
  PRECIO_ACTUALIZAR: 'precio_actualizar',

  // INVENTARIO
  INVENTARIO_LEER: 'inventario_leer',
  INVENTARIO_ACTUALIZAR: 'inventario_actualizar',

  // OPORTUNIDADES Y COTIZACIONES
  OPORTUNIDAD_CREAR: 'oportunidad_crear',
  OPORTUNIDAD_LEER: 'oportunidad_leer',
  OPORTUNIDAD_ACTUALIZAR: 'oportunidad_actualizar',
  OPORTUNIDAD_ELIMINAR: 'oportunidad_eliminar',



  COTIZACION_CREAR: 'cotizacion_crear',
  COTIZACION_LEER: 'cotizacion_leer',
  COTIZACION_ACTUALIZAR: 'cotizacion_actualizar',
  COTIZACION_ELIMINAR: 'cotizacion_eliminar',
  COTIZACION_EXPORTAR: 'cotizacion_exportar',

  // PEDIDOS
  PEDIDO_CREAR: 'pedido_crear',
  PEDIDO_LEER_TODOS: 'pedido_leer_todos',
  PEDIDO_DESPACHAR: 'pedido_despachar',
  NOTAS_CREAR: 'notas_crear',

  // CLIENTES
  CLIENTE_CREAR: 'cliente_crear',
  CLIENTE_LEER: 'cliente_leer',
  CLIENTE_ACTUALIZAR: 'cliente_actualizar',
  CLIENTE_ELIMINAR: 'cliente_eliminar',
} as const;
