# Tema Claro y Oscuro en Botopia WhatsApp

Esta documentación describe la implementación del sistema de temas claro y oscuro en la aplicación Botopia WhatsApp.

## Tecnologías Utilizadas

- **next-themes**: Biblioteca para manejar el cambio de temas en aplicaciones Next.js
- **Tailwind CSS**: Framework CSS con soporte nativo para modo oscuro
- **CSS Variables**: Variables CSS personalizadas para mantener consistencia en el diseño

## Estructura de Temas

El sistema de temas está implementado siguiendo las mejores prácticas para aplicaciones Next.js modernas:

1. **Variables de Tema**: Definidas en `globals.css`
2. **Clases Condicionales**: Utilizando la sintaxis `dark:` de Tailwind CSS
3. **Componentes Adaptables**: Todos los componentes utilizan variables de tema en lugar de colores fijos

## Variables de Tema

Las principales variables de tema incluyen:

```css
:root {
  --background: oklch(1 0 0);             /* Fondo principal (blanco) */
  --foreground: oklch(0.141 0.005 285.823); /* Texto principal (negro) */
  --card: oklch(1 0 0);                   /* Fondo de tarjetas */
  --card-foreground: oklch(0.141 0.005 285.823); /* Texto en tarjetas */
  --popover: oklch(1 0 0);                /* Fondo de popovers */
  --muted: oklch(0.967 0.001 286.375);    /* Fondo para elementos atenuados */
  --muted-foreground: oklch(0.552 0.016 285.938); /* Texto atenuado */
  /* ... otras variables ... */
}

.dark {
  --background: oklch(0.141 0.005 285.823); /* Fondo principal (oscuro) */
  --foreground: oklch(0.985 0 0);          /* Texto principal (blanco) */
  --card: oklch(0.21 0.006 285.885);       /* Fondo de tarjetas oscuro */
  /* ... otras variables en modo oscuro ... */
}
```

## Componentes con Soporte de Temas

Todos los componentes principales tienen soporte completo para temas:

1. **Componentes de Layout**
   - Header.tsx
   - Footer.tsx
   - SidebarLayout.tsx
   - Hero.tsx

2. **Componentes de WhatsApp**
   - WhatsAppSideBar.tsx
   - WhatsAppHeader.tsx
   - WhatsAppMainContent.tsx
   - WhatsAppMessageBubble.tsx
   - WhatsAppMessageSection.tsx

3. **Componentes de UI**
   - MessageCard.tsx
   - ServiceCard.tsx
   - DiagonalBackground.tsx
   - Todos los componentes en `/ui/`

4. **Componentes de Autenticación**
   - Login
   - Register
   - ChangePassword
   - RequestOTPCode
   - VerityOTPCode

5. **Componentes de Flujos**
   - ThemeSwitcher.tsx

## Cómo Usar el Tema

### Cambio de Tema

El componente `ThemeToggle.tsx` permite a los usuarios cambiar entre temas claro y oscuro. Este componente está integrado en varios lugares de la aplicación:

- Header principal
- Sidebar lateral
- WhatsApp sidebar
- Sección de flujos

### Desarrollo con Soporte de Temas

Al desarrollar nuevos componentes, sigue estas pautas:

1. **Utiliza variables CSS de tema** en lugar de colores fijos:
   ```jsx
   // ❌ Mal
   <div className="bg-white text-black">...</div>
   
   // ✅ Bien
   <div className="bg-background text-foreground">...</div>
   ```

2. **Proporciona variantes para modo oscuro** cuando sea necesario:
   ```jsx
   <div className="border-gray-100 dark:border-gray-800">...</div>
   ```

3. **Usa componentes UI existentes** que ya tienen soporte de tema:
   ```jsx
   import { Card } from "@/components/ui/card";
   
   <Card>Este componente ya se adapta al tema actual</Card>
   ```

## Estrategia de Tema Preferido

La aplicación respeta las preferencias del usuario:

1. **Preferencia Guardada**: Si el usuario ha seleccionado un tema, se mantiene en localStorage
2. **Preferencia del Sistema**: Si no hay tema seleccionado, se usa la preferencia del sistema operativo
3. **Tema por Defecto**: Si no se puede determinar, se usa el tema del sistema

## Extendiendo el Sistema de Temas

Para añadir nuevas variables de tema:

1. Agrega las variables en `:root` y `.dark` en `globals.css`
2. Utiliza las variables en tus componentes con `var(--mi-variable)`
3. O úsalas a través de Tailwind extendiendo el tema en `tailwind.config.js`

## Pruebas de Temas

Antes de enviar cambios, asegúrate de probar:

1. Cambio de tema en tiempo real
2. Apariencia en ambos temas
3. Respeto de la preferencia del usuario
4. Accesibilidad y contraste en ambos temas
