export interface Colors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  success: string;
  warning: string;
  danger: string;
  background: string;
  surface: string;
  border: string;
  text: string;
  textLight: string;
  white: string;
  black: string;
}

export interface Typography {
  h1: { fontSize: number; fontWeight: string; color: string };
  h2: { fontSize: number; fontWeight: string; color: string };
  h3: { fontSize: number; fontWeight: string; color: string };
  body: { fontSize: number; color: string };
  bodySmall: { fontSize: number; color: string };
  caption: { fontSize: number; color: string };
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

export interface Radius {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface Shadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface Shadows {
  light: Shadow;
  md: Shadow;
  lg: Shadow;
}

export interface ComponentDefaults {
  button: {
    height: number;
    paddingVertical: number;
    paddingHorizontal: number;
    borderRadius: number;
    fontSize: number;
    color: string;
  };
}

export interface Theme {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  radius: Radius;
  shadows: Shadows;
  components: ComponentDefaults;
}
