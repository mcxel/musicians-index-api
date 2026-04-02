import { Controller, Get, Post, Delete, Param, Body, Query, Request, UseGuards } from '@nestjs/common';
import { StoreService } from './store.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get('items')
  getItems(@Query('category') category?: string, @Query('type') type?: string) {
    return this.storeService.getItems({ category, type });
  }

  @Get('items/:id')
  getItem(@Param('id') id: string) {
    return this.storeService.getItem(id);
  }

  @Get('cart')
  @UseGuards(AuthGuard)
  getCart(@Request() req: any) {
    return this.storeService.getCart(req.user.id);
  }

  @Post('cart')
  @UseGuards(AuthGuard)
  addToCart(@Request() req: any, @Body() body: { itemId: string; quantity?: number }) {
    return this.storeService.addToCart(req.user.id, body.itemId, body.quantity);
  }

  @Delete('cart/:itemId')
  @UseGuards(AuthGuard)
  removeFromCart(@Request() req: any, @Param('itemId') itemId: string) {
    return this.storeService.removeFromCart(req.user.id, itemId);
  }

  @Post('checkout')
  @UseGuards(AuthGuard)
  checkout(@Request() req: any) {
    return this.storeService.checkout(req.user.id);
  }

  @Get('purchases')
  @UseGuards(AuthGuard)
  getPurchases(@Request() req: any) {
    return this.storeService.getPurchases(req.user.id);
  }
}
