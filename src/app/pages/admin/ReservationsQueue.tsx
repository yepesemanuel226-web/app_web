import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Users, Bell, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ReservationsQueue() {
  const queues = [
    {
      bookId: 1,
      bookTitle: 'El amor en los tiempos del cólera',
      author: 'Gabriel García Márquez',
      queue: [
        { userId: 1, userName: 'Laura Ruiz', email: 'laura@outlook.com', reservedDate: '2026-05-07', position: 1 },
        { userId: 2, userName: 'Pedro Gómez', email: 'pedro@gmail.com', reservedDate: '2026-05-08', position: 2 },
      ]
    },
    {
      bookId: 2,
      bookTitle: 'La sombra del viento',
      author: 'Carlos Ruiz Zafón',
      queue: [
        { userId: 3, userName: 'María González', email: 'maria@gmail.com', reservedDate: '2026-05-05', position: 1 },
        { userId: 4, userName: 'Ana Martínez', email: 'ana@gmail.com', reservedDate: '2026-05-06', position: 2 },
        { userId: 5, userName: 'Juan Pérez', email: 'juan@hotmail.com', reservedDate: '2026-05-07', position: 3 },
      ]
    },
    {
      bookId: 3,
      bookTitle: 'Crónica de una muerte anunciada',
      author: 'Gabriel García Márquez',
      queue: [
        { userId: 6, userName: 'Carlos López', email: 'carlos@yahoo.com', reservedDate: '2026-05-08', position: 1 },
      ]
    },
  ];

  const handleNotifyNext = (bookTitle: string, userName: string) => {
    toast.success(`Notificación enviada a ${userName} sobre "${bookTitle}"`);
  };

  const handleRemoveFromQueue = (userName: string, bookTitle: string) => {
    toast.info(`${userName} removido de la cola de "${bookTitle}"`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3A5C] mb-2">Cola de reservas</h1>
        <p className="text-gray-600">Administra las listas de espera de los libros</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {queues.map((item) => (
          <Card key={item.bookId}>
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#1A3A5C] mb-1">{item.bookTitle}</h2>
                  <p className="text-gray-600">{item.author}</p>
                </div>
                <Badge variant="info">
                  <Users className="w-3 h-3 inline mr-1" />
                  {item.queue.length} en cola
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              {item.queue.map((user) => (
                <div
                  key={user.userId}
                  className={`border rounded-lg p-4 ${user.position === 1 ? 'border-[#E8A020] bg-[#FFF9EC]' : 'border-gray-200'}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 bg-[#1A3A5C] text-white font-bold rounded-full">
                        {user.position}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-[#1A3A5C]">{user.userName}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">Reservado el {user.reservedDate}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {user.position === 1 && (
                        <Button
                          size="sm"
                          onClick={() => handleNotifyNext(item.bookTitle, user.userName)}
                        >
                          <Bell className="w-4 h-4 mr-1" />
                          Notificar
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromQueue(user.userName, item.bookTitle)}
                        className="text-[#D32F2F] hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {queues.length === 0 && (
        <Card className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay colas de reserva activas</h3>
          <p className="text-gray-500">Las colas aparecerán aquí cuando los usuarios reserven libros</p>
        </Card>
      )}
    </div>
  );
}
