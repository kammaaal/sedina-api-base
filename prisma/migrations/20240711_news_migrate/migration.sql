-- DropForeignKey
ALTER TABLE `berita` DROP FOREIGN KEY `berita_author_id_fkey`;

-- DropTable
DROP TABLE `berita`;

-- CreateTable
CREATE TABLE `news` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `summary` TEXT NULL,
    `content` TEXT NOT NULL,
    `photo` VARCHAR(191) NULL,
    `view_count` INTEGER NOT NULL DEFAULT 0,
    `status_code` INTEGER NOT NULL DEFAULT 1,
    `status_label` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `author_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `news_tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `news_tags_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_NewsToNewsTag` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_NewsToNewsTag_AB_unique`(`A`, `B`),
    INDEX `_NewsToNewsTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `news` ADD CONSTRAINT `news_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_NewsToNewsTag` ADD CONSTRAINT `_NewsToNewsTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `news`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_NewsToNewsTag` ADD CONSTRAINT `_NewsToNewsTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `news_tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
