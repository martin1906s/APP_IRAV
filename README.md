# IRAV — Biblia para jóvenes (Expo 54)

## Arrancar
```bash
cd IRAV
copy .env.example .env
npm start
```

Pega tu clave de Gemini en `.env` como `EXPO_PUBLIC_GEMINI_API_KEY`.

## Estructura
- `domain` entidades y puertos
- `application` casos de uso
- `infrastructure` adaptadores (Biblia, Gemini, voz)
- `presentation` Atomic Design (atoms → screens)
- `composition` inyección de dependencias
