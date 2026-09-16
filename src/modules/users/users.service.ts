import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  getAllUsers() {
    return [];
  }

  getSingleUser(id: number) {
    // const user = this.getAllUsers.find(ticket => ticket.id === id);
    // if (!ticket) {
    //   throw new NotFoundException(`Ticket with ID ${id} not found!`);
    // }

    return {
      name: 'Prince',
      age: 22,
    };
  }
}
