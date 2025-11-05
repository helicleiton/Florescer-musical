import type { Student } from '../types';

type InitialStudent = Omit<Student, 'id' | 'registrationDate'>;

export const initialStudents: InitialStudent[] = [
  // Teclado A (Terça 08:00)
  { name: 'Abimael Alves Nogueira', age: 9, workshopName: 'Teclado A' },
  { name: 'Amanda Cunha Domingos', age: 12, workshopName: 'Teclado A' },
  { name: 'Hariel Lima Lopes', age: 8, workshopName: 'Teclado A' },
  { name: 'Paulo Samuel da Silva Alves', age: 10, workshopName: 'Teclado A' },
  { name: 'Sâmily Sousa da Silva', age: 9, workshopName: 'Teclado A' },

  // Musicalização Infantil A (Terça 09:00)
  { name: 'Heitor Rodrigues Paz Melo', age: 6, workshopName: 'Musicalização Infantil A' },
  { name: 'Josue Luiz de Aquino da Silva', age: 7, workshopName: 'Musicalização Infantil A' },
  { name: 'Luandiel Emanuel Martins dos Santos', age: 5, workshopName: 'Musicalização Infantil A' },
  { name: 'Miguel Khalil da Silva Wolff', age: 4, workshopName: 'Musicalização Infantil A' },
  { name: 'Samuel de Sousa Ferreira', age: 5, workshopName: 'Musicalização Infantil A' },
  { name: 'Sophia Araujo de Lima', age: 7, workshopName: 'Musicalização Infantil A' },

  // Teclado B (Terça 14:00)
  { name: 'Adriel Holanda Sousa de Santana', age: 11, workshopName: 'Teclado B' },
  { name: 'Aghata Marques Alves', age: 9, workshopName: 'Teclado B' },
  { name: 'Cristian Nicollas Antunes da Silva', age: 8, workshopName: 'Teclado B' },
  { name: 'Willyam Bryan Marques Alves', age: 11, workshopName: 'Teclado B' },

  // Musicalização Infantil B (Terça 15:00)
  { name: 'Angelo Fernandes Menezes', age: 6, workshopName: 'Musicalização Infantil B' },
  { name: 'Anthony Victor Ferreira de Lima', age: 5, workshopName: 'Musicalização Infantil B' },
  { name: 'Jhon Lucas Fernandes Barros', age: 6, workshopName: 'Musicalização Infantil B' },
  { name: 'Joaquim Alves de Lima', age: 5, workshopName: 'Musicalização Infantil B' },
  { name: 'Maria Isabella Lino do Nascimento', age: 7, workshopName: 'Musicalização Infantil B' },
  { name: 'Mariana Oliveira Bezerra', age: 7, workshopName: 'Musicalização Infantil B' },

  // Teclado C (Terça 16:00)
  { name: 'Alícia Diva Moreira Ferreira', age: 11, workshopName: 'Teclado C' },
  { name: 'Andre Nogueira Bessa', age: 12, workshopName: 'Teclado C' },
  { name: 'Benjamin Jucá Trevisam', age: 11, workshopName: 'Teclado C' },
  { name: 'Emylle Sophia Maciel de Aguiar', age: 10, workshopName: 'Teclado C' },
  { name: 'Helano Rodrigues Crisostomo', age: 11, workshopName: 'Teclado C' },
  { name: 'João Rafael de Sousa Maia', age: 7, workshopName: 'Teclado C' },
  { name: 'Maria Luiza de Sousa Maia', age: 11, workshopName: 'Teclado C' },
  { name: 'Péricles dos Santos Matias', age: 11, workshopName: 'Teclado C' },

  // Teclado E1 (Terça 17:30)
  { name: 'Dhonny Breno Lima de Oliveira', age: 6, workshopName: 'Teclado E1' },
  { name: 'Nacelio Gabriel Lima Pereira', age: 7, workshopName: 'Teclado E1' },
  { name: 'Ravi Lopes Santiago', age: 5, workshopName: 'Teclado E1' },
  { name: 'Heitor Chagas Rocha', age: 9, workshopName: 'Teclado E1' },
  { name: 'Iuri de Oliveira', age: 14, workshopName: 'Teclado E1' },

  // Teclado E2 (Terça 18:30)
  { name: 'Maria Nicole Sebastião da Silva', age: 11, workshopName: 'Teclado E2' },
  { name: 'Pablo Javier Oliveira França', age: 8, workshopName: 'Teclado E2' },
  { name: 'Pedro Daniel Chagas Rocha', age: 11, workshopName: 'Teclado E2' },
  { name: 'Victor Gabriel de Oliveira Alves', age: 10, workshopName: 'Teclado E2' },

  // Violão A (Quinta 08:00)
  { name: 'Adrícia Kelly Barbosa Magalhães', age: 15, workshopName: 'Violão A' },
  { name: 'Ana Vitória Andressa Barbosa da Silva', age: 9, workshopName: 'Violão A' },
  { name: 'Bianca Beatriz Lima da Silva', age: 14, workshopName: 'Violão A' },
  { name: 'Gisele Silva de Sousa', age: 14, workshopName: 'Violão A' },
  { name: 'Isabella da Silva Lima', age: 14, workshopName: 'Violão A' },
  { name: 'James Santos de Sousa Filho', age: 17, workshopName: 'Violão A' },
  { name: 'Maria Julia Lima de Oliveira', age: 11, workshopName: 'Violão A' },
  { name: 'Moises Linhares de Medeiros Filho', age: 8, workshopName: 'Violão A' },

  // Violão B (Quinta 14:00)
  { name: 'Carlos Felipe de Lima', age: 11, workshopName: 'Violão B' },
  { name: 'David Henrique Freitas dos Santos', age: 12, workshopName: 'Violão B' },
  { name: 'Francisco Lourenço Sabino dos Santos', age: 9, workshopName: 'Violão B' },
  { name: 'Isis Maria Bandeira Barroso', age: 11, workshopName: 'Violão B' },
  { name: 'João Moreira de Carvalho Neto', age: 9, workshopName: 'Violão B' },
  { name: 'Lazaro Cruz de Sousa', age: 15, workshopName: 'Violão B' },
  { name: 'Maria Ariele da Silva Costa', age: 14, workshopName: 'Violão B' },
  { name: 'Pedro Henrrique Paulino da Silva', age: 12, workshopName: 'Violão B' },

  // Musicalização Infantil C (Quinta 15:00)
  { name: 'Ana Sofia da Mata Alexandre', age: 8, workshopName: 'Musicalização Infantil C' },
  { name: 'Arthur Pereira dos Santos', age: 7, workshopName: 'Musicalização Infantil C' },
  { name: 'Daniel Salviano Martins', age: 8, workshopName: 'Musicalização Infantil C' },
  { name: 'João Lucas da Mata de Lima', age: 8, workshopName: 'Musicalização Infantil C' },
  { name: 'Maria Cecilia da Silva Miranda', age: 8, workshopName: 'Musicalização Infantil C' },
  { name: 'Maria Clara de Castro Agostinho', age: 7, workshopName: 'Musicalização Infantil C' },
  { name: 'Nicollas Caio Antunes da Silva', age: 8, workshopName: 'Musicalização Infantil C' },
  { name: 'Samuel Lucas Santos Pereira', age: 8, workshopName: 'Musicalização Infantil C' },
  
  // Violão C (Quinta 18:00)
  { name: 'Davi Batista Leite', age: 15, workshopName: 'Violão C' },
  { name: 'Enrick Levi de Jesus Sousa', age: 8, workshopName: 'Violão C' },
  { name: 'Enzo Gabriel Pereira da Silva', age: 10, workshopName: 'Violão C' },
  { name: 'Heitor Nicolau Pinheiro', age: 14, workshopName: 'Violão C' },
  { name: 'Laryssa Mais Sombra', age: 10, workshopName: 'Violão C' },
  { name: 'Luiz Felipe Oliveira da Costa', age: 15, workshopName: 'Violão C' },
  { name: 'Luiz Manoel Felix da Silva', age: 9, workshopName: 'Violão C' },
  { name: 'Miguel Enzo de Souza Cassimiro', age: 8, workshopName: 'Violão C' },
  { name: 'Yasmin Araujo de Lima', age: 16, workshopName: 'Violão C' },

  // Técnica Vocal (Sábado 08:00)
  { name: 'Isis Maria Bandeira Barroso', age: 11, workshopName: 'Técnica Vocal' },
  { name: 'Maria Ariele da Silva Costa', age: 14, workshopName: 'Técnica Vocal' },

  // Teclado D (Sábado 13:00)
  { name: 'Anna Sophia Costa Vecente', age: 9, workshopName: 'Teclado D' },
  { name: 'Ester Felix Bezerra', age: 11, workshopName: 'Teclado D' },
  { name: 'Maria Edurda Serafim Ribeiro', age: 13, workshopName: 'Teclado D' },
  { name: 'Maria Fernada Estevam Freire', age: 14, workshopName: 'Teclado D' },
  { name: 'Maria Rayssa dos Santos Lima', age: 12, workshopName: 'Teclado D' },
  { name: 'Maria Renata Freitas da Silva', age: 12, workshopName: 'Teclado D' },

  // Teclado F (Sábado 14:00)
  { name: 'Ana Beatriz de Freitas da Silva', age: 10, workshopName: 'Teclado F' },
  { name: 'Debora Evelyn de Freitas da Silva', age: 14, workshopName: 'Teclado F' },
  { name: 'Luan Rodrigues Paz Melo', age: 12, workshopName: 'Teclado F' },
  { name: 'Lucas Maia Sombra', age: 10, workshopName: 'Teclado F' },
  { name: 'Ryana Maria Sousa Lima', age: 13, workshopName: 'Teclado F' },

  // Musicalização Infantil D (Sábado 15:00)
  { name: 'Ana Alécia Cavalcante Oliveira', age: 6, workshopName: 'Musicalização Infantil D' },
  { name: 'Ana Luiza Maciel da Silva', age: 7, workshopName: 'Musicalização Infantil D' },
  { name: 'Anna Sophia Pereira de Lima', age: 5, workshopName: 'Musicalização Infantil D' },
  { name: 'Heito de Sousa Freitas', age: 5, workshopName: 'Musicalização Infantil D' },
  { name: 'Joao Gabriel Guerreiro da Silva', age: 7, workshopName: 'Musicalização Infantil D' },
  { name: 'Maria Alice Lino do Nascimento', age: 5, workshopName: 'Musicalização Infantil D' },

  // Alunos Avulsos (sem turma fixa)
  { name: 'Hadassa Ellen da Silva Bezerra', age: 9, workshopName: null },
  { name: 'Hiago Salviano Araruna', age: 5, workshopName: null },
];