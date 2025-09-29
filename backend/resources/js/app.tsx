import '../css/app.css';


import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import ModalProvider from './providers/ModalProvider'; // ⬅️ agregado

const appName = import.meta.env.VITE_APP_NAME || 'GradEm-UNA';

// Creamos la aplicación Inertia
createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),

    // Solo resolvemos las páginas dentro de resources/js/pages
    resolve: (name) =>
        resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),

    setup({ el, App, props }) {
        const root = createRoot(el);

        // Renderizamos la app con el layout definido en cada página
        root.render(
            <ModalProvider>
                <App {...props} />
            </ModalProvider>
        );
    },

    progress: {
        color: '#CD1719', // Rojo UNA según estándar ER02
    },
});

// Inicializamos tema claro/oscuro
initializeTheme();