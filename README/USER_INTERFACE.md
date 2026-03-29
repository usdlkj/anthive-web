# UI Implementation Plan — Metrica Design in Tailwind + Vue

**Approach:** Replicate Metrica's visual design using Tailwind CSS. Do not use Metrica's compiled CSS, Bootstrap, or jQuery. All interactive behavior is implemented in Vue 3 reactivity.

---

## 1. Design Token Extraction

The following values are extracted directly from `metrica_v3.1/dist/assets/css/app.css` and must be added to `tailwind.config.ts` as custom colors:

### Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `brand` | `#0b51b7` | Primary blue (icon rail bg, active states, buttons) |
| `brand-light` | `#1256b9` | Hover state for icon buttons |
| `sidebar-panel` | `#f8f9fb` | Text panel background |
| `sidebar-border` | `#eceff5` | All borders (card, panel, topbar, footer) |
| `nav-text` | `#5a5c61` | Sidebar nav link default color |
| `nav-active` | `#0b51b7` | Sidebar nav link active color |
| `icon-default` | `#becae6` | Default icon color on the blue icon rail |
| `topbar-icon-bg` | `#f5f5f9` | Icon button background in topbar |
| `topbar-text` | `#384a65` | Topbar text and icon color |
| `body-text` | `#000444` | Main body text |
| `heading` | `#303e67` | Headings (h1–h6) |
| `muted` | `#8491b7` | Muted/secondary text |
| `footer-text` | `#7081b9` | Footer text |
| `auth-header` | `#232a3e` | Login card dark header background |

### Typography

- **Font:** Roboto (import from Google Fonts in `index.html`)
- **Base size:** 13px (`0.8125rem`)
- **Nav link:** 13px, weight 500

### Layout Dimensions

| Element | Size |
|---|---|
| Topbar height | 60px |
| Icon rail (narrow sidebar) | 60px wide |
| Text panel (wide sidebar) | 200px wide |
| Total sidebar | 260px wide |
| Page content top offset | 60px (topbar height) |
| Page content left offset | 260px (full sidebar width) |

---

## 2. Tailwind Config Changes

**File:** `tailwind.config.ts`

```ts
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Roboto', 'sans-serif'] },
      fontSize: { base: '0.8125rem' },
      colors: {
        brand: { DEFAULT: '#0b51b7', light: '#1256b9' },
        'sidebar-panel': '#f8f9fb',
        'sidebar-border': '#eceff5',
        'nav-text': '#5a5c61',
        'nav-active': '#0b51b7',
        'icon-default': '#becae6',
        'topbar-icon-bg': '#f5f5f9',
        'topbar-text': '#384a65',
        'body-text': '#000444',
        heading: '#303e67',
        muted: '#8491b7',
        'footer-text': '#7081b9',
        'auth-header': '#232a3e',
      },
    },
  },
}
```

No changes needed to `globals.css` — keep all three `@tailwind` directives as-is.

---

## 3. jQuery / Bootstrap JS → Vue 3 Replacements

Every interactive behavior from Metrica's `app.js`, jQuery, and Bootstrap JS is replaced with a Vue reactive equivalent:

| Metrica behavior | Vue 3 replacement |
|---|---|
| `data-bs-toggle="tab"` sidebar tab switching | `activeTab` ref + `:class` conditional + `v-show` on panels |
| Active tab arrow indicator (`::before` CSS) | Tailwind `before:` utilities on the active tab button |
| `data-bs-toggle="collapse"` sub-menus | `openSections` Set ref + `v-show` + rotate chevron `:class` |
| Bootstrap dropdown (user menu) | `userMenuOpen` ref + `@click.outside` directive or `onClickOutside` |
| Bootstrap modal open/close | `v-show` overlay + `@click.self` to close backdrop |
| Sidebar enlarge/collapse toggle | `sidebarExpanded` ref + `<Transition>` for width animation |
| Simplebar custom scrollbar | Native `overflow-y-auto` with CSS scrollbar styling via Tailwind |
| Feather icon init | `lucide-vue-next` (already installed and in use) |
| Tabler Icons (`ti-*`) | `lucide-vue-next` equivalents (same icon set origin) |

---

## 4. File Changes by Phase

### Phase 1 — Foundation ✅ COMPLETE

**1. Update `index.html`**
- Add `<link>` for Roboto from Google Fonts
- Remove `<title>` placeholder

**2. Update `tailwind.config.ts`**
- Add color tokens and Roboto font as described above

**3. Rewrite `src/layouts/MainLayout.vue`**
This is the most significant change. The new layout structure in Tailwind:

```
<div class="flex h-screen">

  <!-- Icon Rail: fixed, 60px, brand blue background -->
  <aside class="fixed top-0 left-0 h-full w-[60px] bg-brand flex flex-col items-center py-4 z-50">
    <!-- Logo -->
    <!-- Tab buttons (4 icons, activeTab reactive state) -->
    <!-- User avatar at bottom -->
  </aside>

  <!-- Text Panel: fixed, 200px, light gray background, left-[60px] -->
  <div v-show="sidebarExpanded" class="fixed top-0 left-[60px] h-full w-[200px] bg-sidebar-panel border-r border-sidebar-border z-40">
    <!-- Logo text -->
    <!-- Nav link groups (v-show panels per activeTab) -->
  </div>

  <!-- Main area: margin-left-[260px], margin-top-[60px] -->
  <div class="flex-1 ml-[260px]">

    <!-- Topbar: fixed, h-[60px], white, border-b -->
    <header class="fixed top-0 left-[260px] right-0 h-[60px] bg-white border-b border-sidebar-border z-30 flex items-center justify-between px-5">
      <!-- Left: CurrentProjectSelect or label -->
      <!-- Right: user name + dropdown -->
    </header>

    <!-- Page content -->
    <main class="mt-[60px] p-2 min-h-screen bg-white">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="px-4 py-4 border-t border-sidebar-border text-footer-text text-sm">
      © Anthive DMS
    </footer>

  </div>

</div>
```

**Reactive state in `MainLayout.vue`:**
```ts
const activeTab = ref<'dashboard' | 'documents' | 'admin' | 'profile'>('dashboard')
const sidebarExpanded = ref(true)
const openSections = ref<Set<string>>(new Set())
const userMenuOpen = ref(false)

function toggleSection(key: string) {
  openSections.value.has(key) ? openSections.value.delete(key) : openSections.value.add(key)
}
```

**4. Rewrite `src/views/LoginView.vue`**
Metrica auth layout in Tailwind:

```
<div class="min-h-screen bg-cover bg-center flex items-center justify-center" style="background-image: url('/metrica-bg.png')">
  <div class="w-full max-w-sm">
    <div class="bg-white rounded-lg overflow-hidden shadow-lg">
      <!-- Dark header: bg-auth-header, logo + title -->
      <div class="bg-auth-header p-6 text-center text-white">...</div>
      <!-- Form body -->
      <div class="p-6">... form ...</div>
    </div>
  </div>
</div>
```

Copy only `metrica_v3.1/dist/assets/images/p-1.png` and `logo-sm.png` to `anthive-web/public/` for the background and logo.

### Phase 2 — Core Components ✅ COMPLETE

**5. Create `src/components/ui/PageWrapper.vue`**
```html
<template>
  <div class="px-2 py-4">
    <div class="flex items-center justify-between mb-4">
      <h4 class="text-[18px] font-medium text-heading m-0">{{ title }}</h4>
      <nav class="text-[13px] text-muted">
        <slot name="breadcrumb" />
      </nav>
    </div>
    <slot />
  </div>
</template>
```

**6. Rewrite `src/components/tables/BackofficeDataTable.vue`**
Replace Tailwind table styles with Metrica card + table look:
```html
<div class="bg-white border border-sidebar-border rounded-lg mb-4">
  <!-- Card header: search + add button -->
  <div class="px-4 py-3 border-b border-sidebar-border flex items-center justify-between">...</div>
  <!-- Table -->
  <table class="w-full text-[13px]">
    <thead class="bg-sidebar-panel text-nav-text text-left">...</thead>
    <tbody class="divide-y divide-sidebar-border">...</tbody>
  </table>
  <!-- Pagination footer: dashed border-t -->
  <div class="px-4 py-3 border-t border-dashed border-sidebar-border flex items-center justify-between">...</div>
</div>
```

**7. Rewrite `src/components/ui/AppDialog.vue`**
Custom Tailwind modal (same `open`/`close` prop-emit contract — no changes needed in any modal component):
```html
<!-- Backdrop -->
<Teleport to="body">
  <div v-show="open" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40" @click="$emit('close')" />
    <div class="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
      <!-- Header: border-b -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-sidebar-border">
        <h5 class="font-medium text-heading">{{ title }}</h5>
        <button @click="$emit('close')">×</button>
      </div>
      <!-- Body -->
      <div class="px-5 py-4"><slot /></div>
    </div>
  </div>
</Teleport>
```

### Phase 3 — Views ✅ COMPLETE

Wrap every view with `<PageWrapper :title="..." >` and convert inline Tailwind layout divs to Bootstrap-equivalent grid using Tailwind's `grid` or `flex` utilities.

Files to update (script logic stays unchanged):
- `src/views/DashboardView.vue`
- `src/views/documents/DocumentsView.vue`
- `src/views/documents/DocumentUploadView.vue`
- `src/views/admin/companies/CompaniesView.vue`
- `src/views/admin/companies/CompanyUsersView.vue`
- `src/views/admin/projects/ProjectsView.vue`
- `src/views/admin/projects/ProjectFieldsView.vue`
- `src/views/admin/projects/ProjectMembersView.vue`
- `src/views/me/ProfileView.vue`
- `src/views/me/ChangePasswordView.vue`

### Phase 4 — Modal Form Inputs ✅ COMPLETE

Replace Tailwind form input classes in 6 modal components with Metrica-styled equivalents:

```html
<!-- Label -->
<label class="block text-[13px] font-medium text-nav-text mb-1">Field Name</label>
<!-- Input -->
<input class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30" />
<!-- Button primary -->
<button class="bg-brand hover:bg-brand-light text-white text-[13px] font-medium px-4 py-2 rounded transition-colors">Save</button>
```

Modal components: `CompanyModal`, `ProjectModal`, `ProjectFieldModal`, `ProjectMemberModal`, `DocumentModal`, `UserModal`.

---

## 5. Sidebar Navigation Structure

| Icon Tab | Icon (lucide) | Text Panel Contents | Visible To |
|---|---|---|---|
| Dashboard | `LayoutDashboard` | Dashboard | Everyone |
| Documents | `FileText` | Documents, Upload Document | Client team only |
| Administration | `Settings` | Companies, Projects | Anthive team only |
| Profile | `User` | Profile, Change Password | Everyone |

Active tab button style: white bg chip (`bg-white/20 rounded`), icon turns white. Inactive: icon color `#becae6`.

Active arrow indicator: active tab button gets a right-pointing triangle CSS pseudo-element pointing toward the text panel (`before:border-r-sidebar-panel`).

---

## 6. What Does NOT Change

- All `<script setup>` logic in every view and component
- Router configuration (`src/router/index.ts`)
- Pinia auth store (`src/stores/auth.ts`)
- Axios/API layer (`src/lib/`)
- Interfaces (`src/interfaces/`)
- `vue-sonner` toaster in `App.vue`
- Docker / Nginx setup
