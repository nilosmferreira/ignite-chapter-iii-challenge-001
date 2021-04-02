import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export const formataData = (data: string, formato: string): string => {
  return format(new Date(data), formato, {
    locale: ptBR,
  });
};
