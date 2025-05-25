/*
  Warnings:

  - You are about to drop the column `descricao` on the `OrdemServico` table. All the data in the column will be lost.
  - You are about to drop the column `valorTotal` on the `OrdemServico` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `OrdemServico` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - You are about to alter the column `papel` on the `Usuario` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - A unique constraint covering the columns `[movCaixaId]` on the table `OrdemServico` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `descricaoServico` to the `OrdemServico` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servicoId` to the `OrdemServico` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorServico` to the `OrdemServico` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `OrdemServico` DROP COLUMN `descricao`,
    DROP COLUMN `valorTotal`,
    ADD COLUMN `descricaoServico` VARCHAR(191) NOT NULL,
    ADD COLUMN `finalizadoPorId` INTEGER NULL,
    ADD COLUMN `modalidadePagamento` ENUM('PIX', 'CARTAO', 'DINHEIRO') NULL,
    ADD COLUMN `movCaixaId` INTEGER NULL,
    ADD COLUMN `servicoId` INTEGER NOT NULL,
    ADD COLUMN `valorServico` DOUBLE NOT NULL,
    MODIFY `status` ENUM('PENDENTE', 'EM_ANDAMENTO', 'PRONTO', 'ENTREGUE') NOT NULL DEFAULT 'PENDENTE';

-- AlterTable
ALTER TABLE `Usuario` MODIFY `papel` ENUM('ADMIN', 'OPERADOR', 'MECANICO') NOT NULL DEFAULT 'OPERADOR';

-- CreateTable
CREATE TABLE `Servico` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Servico_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CaixaMov` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('ENTRADA', 'SAIDA') NOT NULL,
    `valor` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usuarioId` INTEGER NOT NULL,
    `caixaId` INTEGER NOT NULL,
    `ordemId` INTEGER NULL,
    `gastoId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gasto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoria` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usuarioId` INTEGER NOT NULL,
    `movCaixaId` INTEGER NULL,

    UNIQUE INDEX `Gasto_movCaixaId_key`(`movCaixaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `OrdemServico_movCaixaId_key` ON `OrdemServico`(`movCaixaId`);

-- AddForeignKey
ALTER TABLE `OrdemServico` ADD CONSTRAINT `OrdemServico_servicoId_fkey` FOREIGN KEY (`servicoId`) REFERENCES `Servico`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdemServico` ADD CONSTRAINT `OrdemServico_finalizadoPorId_fkey` FOREIGN KEY (`finalizadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdemServico` ADD CONSTRAINT `OrdemServico_movCaixaId_fkey` FOREIGN KEY (`movCaixaId`) REFERENCES `CaixaMov`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CaixaMov` ADD CONSTRAINT `CaixaMov_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CaixaMov` ADD CONSTRAINT `CaixaMov_caixaId_fkey` FOREIGN KEY (`caixaId`) REFERENCES `Caixa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_movCaixaId_fkey` FOREIGN KEY (`movCaixaId`) REFERENCES `CaixaMov`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
