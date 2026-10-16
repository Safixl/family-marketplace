package com.familymarket.store;

import com.familymarket.common.NotFoundException;
import com.familymarket.dto.StoreTemplateDto;
import com.familymarket.product.Product;
import com.familymarket.product.ProductRepository;
import com.familymarket.user.User;
import com.familymarket.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Встроенные шаблоны магазинов (из Shop.xlsx): Чтение, Математика, Дом.
 * Родитель может активировать шаблон — создаётся магазин с готовыми товарами.
 */
@Service
public class StoreTemplateService {

    public record Template(String slug, String name, String description,
                           String currencyName, String currencyIcon, String type,
                           List<ProductSeed> products) {
    }

    public record ProductSeed(String name, String description, BigDecimal price) {
    }

    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public StoreTemplateService(StoreRepository storeRepository,
                                ProductRepository productRepository,
                                UserRepository userRepository) {
        this.storeRepository = storeRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public List<Template> templates() {
        return List.of(reading(), math(), home(), logic(), lang(), sport());
    }

    public Template get(String slug) {
        return templates().stream()
                .filter(t -> t.slug().equals(slug))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Шаблон не найден"));
    }

    /**
     * Активировать шаблон: если магазин этого типа уже есть — вернуть его,
     * иначе создать новый с товарами по умолчанию.
     */
    @Transactional
    public Store activate(Long parentId, String slug) {
        Template template = get(slug);
        return storeRepository.findByParentIdAndTemplateType(parentId, template.type())
                .orElseGet(() -> createFromTemplate(parentId, template));
    }

    private Store createFromTemplate(Long parentId, Template template) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
        Store store = new Store();
        store.setParent(parent);
        store.setName(template.name());
        store.setDescription(template.description());
        store.setCurrencyName(template.currencyName());
        store.setCurrencyIcon(template.currencyIcon());
        store.setActive(true);
        store.setTemplateType(template.type());
        store.setCreatedAt(Instant.now());
        store = storeRepository.save(store);

        for (ProductSeed seed : template.products()) {
            Product product = new Product();
            product.setStore(store);
            product.setName(seed.name());
            product.setDescription(seed.description());
            product.setPrice(seed.price());
            product.setLimitPerChild(null);
            product.setActive(true);
            product.setCreatedAt(Instant.now());
            productRepository.save(product);
        }
        return store;
    }

    public static StoreTemplateDto toDto(Template template) {
        return new StoreTemplateDto(template.slug(), template.name(), template.description(),
                template.currencyName(), template.currencyIcon(), template.type());
    }

    private Template reading() {
        return new Template(
                "reading", "Чтение",
                "Баллы за прочитанные книги: страницы × множитель. Родитель отмечает прочитанное, ребёнок копит баллы.",
                "баллы за чтение", "📚", "READING",
                List.of(
                        seed("1 серия мультик/аниме", 50),
                        seed("1 фильм/мультфильм", 150),
                        seed("30 минут игра на PS4", 75),
                        seed("30 минут игра на Компьютере", 100),
                        seed("15 минут лимита на телефоне", 100),
                        seed("30 минут ютуб", 120),
                        seed("Поход в кино-театр", 800),
                        seed("Безлимит на телефон на день", 1000),
                        seed("Поездка в аквапарк", 2500),
                        seed("Поездка в парк аттракционов", 5000)));
    }

    private Template math() {
        return new Template(
                "math", "Математика",
                "Родитель составляет задачи, ребёнок решает и получает баллы за правильные ответы.",
                "баллы за математику", "🧮", "MATH",
                List.of(
                        seed("Пополнить карту на 1000 руб.", 1000),
                        seed("Увеличить карманные деньги на неделю на 100 руб.", 1000),
                        seed("Увеличить лимит на Телевизор на 15 минут", 500),
                        seed("Увеличить лимит на Компьютер и приставку на 15 минут", 1000),
                        seed("Увеличить лимит на Телефон на 15 минут", 1500),
                        seed("Скачать приложение или игру на телефон", 300),
                        seed("Поход в кино-театр", 800),
                        seed("Поездка в аквапарк", 2500),
                        seed("Поездка в парк аттракционов", 5000)));
    }

    private Template home() {
        return new Template(
                "home", "Дом",
                "Календарь домашних дел: порядок в комнате и помощь по дому. Баллы начисляются автоматически за каждый отмеченный день.",
                "баллы за дом", "🏠", "HOME",
                List.of(
                        seed("Покупки на Озон 65 руб.", 65),
                        seed("Умный свет", 46),
                        seed("Игровая приставка", 231),
                        seed("Прикроватная тумбочка", 107),
                        seed("Пуфик зверушка", 107),
                        seed("Средний мягкий ковер", 185),
                        seed("Кровать домиком", 462),
                        seed("Алиса мини", 124),
                        seed("Телевизор 43\"", 308),
                        seed("Замок на двери", 999)));
    }

    private Template logic() {
        return new Template(
                "logic", "Логика",
                "Ежедневные дейлики логики: загадки, ребусы и задачи на мышление. 1 правильный ответ = 1 IQ-коин. Блок без ошибок даёт бонус XP.",
                "IQ-коины", "🧠", "LOGIC",
                List.of(
                        seed("Кубик Рубика", 120),
                        seed("Настольная игра «Эволюция»", 800),
                        seed("Набор фокусов", 400),
                        seed("Невидимые чернила", 150),
                        seed("Квест в реальности", 1000)));
    }

    private Template lang() {
        return new Template(
                "lang", "Иностранный язык",
                "Ежедневные дейлики языка: карточки слов. 1 выученное слово = 1 лингво-миля.",
                "лингво-мили", "✈️", "LANG",
                List.of(
                        seed("Японские сладости", 200),
                        seed("Редкая газировка", 120),
                        seed("Мерч из сериала", 600),
                        seed("Комикс в оригинале", 500),
                        seed("Скин в игре на иностранном", 300)));
    }

    private Template sport() {
        return new Template(
                "sport", "Спорт и хобби",
                "Ежедневные дейлики спорта и творчества: 10 минут активности = 1 очко энергии, 2000 шагов = 1 очко.",
                "очки энергии", "⚡", "SPORT",
                List.of(
                        seed("Крутой мяч", 300),
                        seed("Фитнес-браслет", 2000),
                        seed("Маркеры Copic", 1500),
                        seed("Билет на картинг", 1200),
                        seed("Поход на скалодром", 800)));
    }

    private ProductSeed seed(String name, int price) {
        return new ProductSeed(name, null, BigDecimal.valueOf(price));
    }
}