import { useState, useEffect } from 'react';

// Função auxiliar para obter o valor do localStorage com segurança
function getStoredValue<T>(key: string, defaultValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    // Se o item existir, faz o parse do JSON, caso contrário retorna o valor padrão
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Erro ao ler a chave “${key}” do localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Um hook customizado do React que sincroniza o estado com o localStorage.
 * @param key A chave para usar no localStorage.
 * @param defaultValue O valor padrão a ser usado se nada for encontrado.
 * @returns Um valor de estado e uma função para atualizá-lo.
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    return getStoredValue(key, defaultValue);
  });

  useEffect(() => {
    try {
      // Atualiza o localStorage sempre que o valor do estado muda
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erro ao definir a chave “${key}” no localStorage:`, error);
    }
  }, [key, value]);

  return [value, setValue];
}
