/*
  Warnings:

  - You are about to alter the column `modalidadePagamento` on the `OrdemServicoItem` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE `OrdemServicoItem` MODIFY `modalidadePagamento` VARCHAR(20) NULL;
