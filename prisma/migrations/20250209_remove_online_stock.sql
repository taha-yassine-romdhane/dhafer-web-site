-- CreateEnum
CREATE TYPE "StockLocation" AS ENUM ('monastir', 'tunis', 'sfax');

-- DropOnlineStocks
DELETE FROM "Stock" WHERE location = 'online';
