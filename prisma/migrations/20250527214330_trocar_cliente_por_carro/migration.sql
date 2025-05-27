/*
  Warnings:

  - You are about to drop the column `clienteId` on the `OrdemServico` table. All the data in the column will be lost.
  - You are about to drop the `Cliente` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `OrdemServico` DROP FOREIGN KEY `OrdemServico_clienteId_fkey`;

-- AlterTable
ALTER TABLE `OrdemServico` DROP COLUMN `clienteId`,
    ADD COLUMN `carroId` INTEGER NULL;

-- DropTable
DROP TABLE `Cliente`;

-- CreateTable
CREATE TABLE `Carro` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `proprietario` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `modelo` VARCHAR(191) NULL,
    `placa` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Carro_placa_key`(`placa`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrdemServico` ADD CONSTRAINT `OrdemServico_carroId_fkey` FOREIGN KEY (`carroId`) REFERENCES `Carro`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
