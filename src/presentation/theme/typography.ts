import { fonts } from './fonts';

export const typography = {
  hero: {
    fontSize: 42,
    fontFamily: fonts.displayBold,
    letterSpacing: -0.5,
    lineHeight: 46,
  },
  title: {
    fontSize: 26,
    fontFamily: fonts.displaySemi,
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 17,
    fontFamily: fonts.sansSemi,
    letterSpacing: 0.1,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontFamily: fonts.sans,
    lineHeight: 25,
  },
  caption: {
    fontSize: 12,
    fontFamily: fonts.sansMedium,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
  },
  verse: {
    fontSize: 18,
    fontFamily: fonts.display,
    lineHeight: 30,
  },
};
