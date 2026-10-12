import { fonts } from './fonts';

export const typography = {
  // Headers
  heroLarge: { fontSize: 32, fontFamily: fonts.display, letterSpacing: -0.5, lineHeight: 40 },
  hero:      { fontSize: 28, fontFamily: fonts.displaySemi, letterSpacing: -0.3, lineHeight: 36 },
  title:     { fontSize: 22, fontFamily: fonts.sansBold, letterSpacing: -0.2, lineHeight: 28 },
  subtitle:  { fontSize: 18, fontFamily: fonts.sansSemi, letterSpacing: 0, lineHeight: 24 },

  // Body
  body:      { fontSize: 15, fontFamily: fonts.sans, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontFamily: fonts.sans, lineHeight: 18 },

  // UI
  button:    { fontSize: 15, fontFamily: fonts.sansSemi, letterSpacing: 0.5, lineHeight: 20 },
  caption:   { fontSize: 12, fontFamily: fonts.sansMedium, letterSpacing: 0.2, lineHeight: 16 },
  tabLabel:  { fontSize: 11, fontFamily: fonts.sansMedium, letterSpacing: 0.3 },

  // Especiales
  verse:     { fontSize: 17, fontFamily: fonts.scripture, lineHeight: 30 },
  chapterNum:{ fontSize: 14, fontFamily: fonts.sansBold, letterSpacing: 0 },

  // Chat
  chatMessage:  { fontSize: 14, fontFamily: fonts.sans, lineHeight: 20 },
  chatTimestamp:{ fontSize: 10, fontFamily: fonts.sansMedium, lineHeight: 14 },
};
