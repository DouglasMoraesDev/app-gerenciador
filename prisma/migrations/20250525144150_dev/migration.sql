-- AlterTable
ALTER TABLE `OrdemServico` ADD COLUMN `parceiroId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `OrdemServico` ADD CONSTRAINT `OrdemServico_parceiroId_fkey` FOREIGN KEY (`parceiroId`) REFERENCES `EmpresaParceira`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
